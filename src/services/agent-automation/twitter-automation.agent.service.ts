
import { Mention } from "../../db/models/Mention";
import { User } from "../../db/models/User";
import { createImage, download_image, sendMessage } from "../open-ai/gpt.service";
import { findUsers, getMentions, replyToMention, tweet } from "../twitter/twitter.service";
import { postOnTgChannels } from "../telegram/telegram.service";
import { sleep } from "../../utils/sleep";
import { Activity, ActivityChannel, ActivityType } from "../../db/models/Activity";
import { Artwork } from "../../db/models/Artwork";

const MAX_REPLIES = Number(process.env.MAX_REPLIES);
const ART_ASSISTANT_ALLOWED = process.env.ART_ASSISTANT_ALLOWED == "1";
const PROFILE_X_ID = process.env.PROFILE_X_ID!;
const BACKEND_URL = process.env.BACKEND_URL!;
const INITIAL_X_TS = 1289001601000;

export async function getAndReplyRecentMentions() {
    try {
        console.log("Checking for new mentions...");
        // Fetch recent mentions for the authenticated user
        const lastMention = await Mention.findOne({ order: [['timestamp', 'DESC']] });
        const lastDate = lastMention ? lastMention.timestamp : INITIAL_X_TS;    
        const mentions = await getMentions(lastDate);

        if(mentions.length == 0){
            console.log("No new mentions");
            await sleep(120000); //sleep for 2 minutes
            return await getAndReplyRecentMentions(); //recursive call to get more mentions
        }
        
        var userIds = mentions.map((mention:any) => mention.author_id!);

        //remove duplicates
        userIds = userIds.filter((id:string, index:number) => userIds.indexOf(id) === index);

        var xUsers = []; 

        for(const id of userIds){
            let user = await User.findByPk(id);
            if(!user){
                user = new User({id: id, username: null, thread_id: null});
                await user.save();
                const activity = new Activity(
                    {
                        type: ActivityType.NEW_USER,
                        channel: ActivityChannel.X,
                        user_id: user.id,
                        timestamp: Date.now(),
                        username: user.username
                    }
                );

                await activity.save();
            }
            xUsers.push(user);
        }

        for(const xUser of xUsers){
            if(xUser?.username){
                userIds = userIds.filter((id:string) => id != xUser.id);
            }
        }
        
        try {
            if(userIds.length > 0){
                console.log(`Fetching username for ${userIds.length} new users`);
                const twitterUsers = await findUsers(userIds);

                for (const user of twitterUsers){
                    let newUser = xUsers.find((xUser) => xUser.id == user.id)!;
                    newUser.username = user.username;
                    await newUser.save();
                }  
            } else {
                console.log("No new users to add");
            }
        } catch (error: any) {
            console.error('Error fetching new users:', error.data);
        } 

        let i = 0;
        for (const mention of mentions){

            let foundMention = await Mention.findByPk(mention.id);
            
            const user = xUsers.find((xUser) => xUser.id == mention.author_id)!;

            if(foundMention || mention.author_id == PROFILE_X_ID){
                continue;
            }

            const log = new Mention({id: mention.id, user_id: mention.author_id, timestamp: (new Date(mention.created_at)).getTime(), message: mention.text});

            const activity = new Activity(
                {
                    type: ActivityType.INTERACTION,
                    channel: ActivityChannel.X,
                    user_id: user.id,
                    username: user.username,
                    message: mention.text,
                    timestamp: (new Date(mention.created_at)).getTime(),
                    
                }
            );

            console.log(`- @${mention.author_id} mentioned you: ${mention.text} (Created at: ${mention.created_at})`);

            if(i < MAX_REPLIES){
                i++;
                const botAnswer = await sendMessage(user, mention.text, false);
                
                if(mention.id && botAnswer){
                    console.log(`- You replied: ${botAnswer}`);

                    const reply = await replyToMention(mention.id, botAnswer!);
                    activity.reply = botAnswer!;

                    if(reply?.id){
                        log.reply = botAnswer!;
                        log.reply_id = reply?.id!;
                        console.log(`- You replied: ${botAnswer}`);
                    }
                    
                }

                
            }

            
            await log.save();
            await activity.save();
            
        };
        
    } catch (error) {
        console.error('Error fetching mentions:', error);
    }

    await sleep(120000); //sleep for 2 minutes
    return await getAndReplyRecentMentions(); //recursive call to get more mentions
}

export async function generateArt(prompt: string | null = null){
    try {
        const answer = prompt ? await sendMessage(null, prompt, !ART_ASSISTANT_ALLOWED) : null;

        var response : any = {
            answer: answer
        }

        if(ART_ASSISTANT_ALLOWED){
            console.log(`Generating image for: ${answer}`);
            const image = await createImage(prompt);
            if(!image){
                console.error(`Error generating art piece`);
                return response;
            }
            const pieceDescription = `This is a detailed prompt for an image generated by Dall-E. ${image.revised_prompt}. Create and return a JSON object with the format.`;
            const details =  await sendMessage(null, pieceDescription); 
            
            console.log(`Answer: [${answer}]`);
            console.log(`Image: [${image}]`);
            console.log(`Details: [${details}]`);

            response = {
                answer: answer,
                image: image,
                details: details
            }
        }
        
        return response;
    } catch (error) {
        console.error(`Error generating art piece: ${error}`);
    }
    
}

export async function createRandomPiece() {

    try{

        const artPiece = await generateArt();

        console.log("Got back from art generation");
        console.log(`- Generated Details: ${artPiece}`);

        if(artPiece.details && artPiece.image?.url){
            console.log(`- You shared: ${artPiece.answer}`);
            console.log(`${artPiece.image?.url!}`);
            console.log(`- You shared: ${artPiece.details}`);
            const content = JSON.parse(artPiece.details);
            const message = `${content.title}

${content.concept}`;
            const imagePath = `src/public/${content.file_name}`;
            await download_image(artPiece.image.url, imagePath);
            await postOnTgChannels(message!, artPiece.image.url);
            const post = await tweet(message!, imagePath);

            const activity = new Activity(
                {
                    type: ActivityType.CREATION_PROCESS,
                    channel: ActivityChannel.CORE,
                    message: content.title,
                    reply: content.concept,
                    timestamp: Date.now()
                }
            );

            await activity.save();

            const artwork = new Artwork({
                file: `${BACKEND_URL}/api-images/${content.file_name}`,
                title: content.title,
                concept: content.concept,
                tags: content.tags,
                post_id: post?.id,
            });

            await artwork.save();
        }
    } catch (error : any) {
        console.error('Error tweeting:', error, error.data);
    }

    
}

export async function postRandomMessage() {

    try{
        //Set the context for Twitter post
        const prompt = "Share your thoughts on a random topic as if you were posting a tweet. Be creative. Your response can have up to 260 characters.";
        const answer = await sendMessage(null, prompt, !ART_ASSISTANT_ALLOWED);

        if(answer){
            
            await postOnTgChannels(answer);
            await tweet(answer)

            console.log(`- You shared: ${answer}`);
        }
    } catch (error : any) {
        console.error('Error tweeting:', error, error.data);
    }

    
}

