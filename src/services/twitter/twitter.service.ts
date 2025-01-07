import { TwitterApi, TwitterApiTokens } from 'twitter-api-v2'
import dotenv from 'dotenv';
import { uploadImageToTwitter } from './twitter.uploader';
dotenv.config();

const TWITTER_PRODUCTION = process.env.TWITTER_PRODUCTION == "1";

export const twitterClient: any = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY || '',
    appSecret: process.env.TWITTER_API_SECRET_KEY || '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
    
});

const PROFILE_X_ID = process.env.PROFILE_X_ID || '';

export async function getMentions(start_time: number){
    try {
        let startDateTime = new Date(Number(start_time));
        console.log(`Mentions since: ${start_time} = ${ startDateTime.toISOString() }`);
        const date = startDateTime.toISOString().split('.')[0]+"Z";
        
        const mentionsResponse = await twitterClient.v2.userMentionTimeline(`${PROFILE_X_ID}`, {
            max_results: 100, // You can set this to retrieve more mentions if needed, up to 100
            start_time: date,
            'tweet.fields': 'created_at,author_id',
            'user.fields': 'id,name,username,verified,verified_type'
        });

        if(mentionsResponse?.data?.data && mentionsResponse?.data?.data?.length > 0){
            console.log(mentionsResponse.data.data[0]);
            console.log(`Total ${mentionsResponse.data.data.length} mentions fetched`);
            return mentionsResponse.data.data;
        }

        return [];
    } catch (error: any) {
        console.error({
            message: "Fetch twitter mentions failure caught!",
            error_data: error.data,
            error_message: error?.message,
            error_stack: error?.stack
        })
        return [];
    }
}

export async function findUsers(userIds: string[]) {
    try {
        console.log("Fetching users...");
        const usersResponse = await twitterClient.v2.users(userIds, {
            'user.fields': 'username'
        });

        if (usersResponse.data && usersResponse.data.length > 0) {
            console.log(`Total ${usersResponse.data.length} users fetched`);
            return usersResponse.data;
        }

        return [];
    } catch (error: any) {
        console.error({
            message: "Fetch twitter users failure caught!",
            error_data: error.data,
            error_message: error?.message,
            error_stack: error?.stack
        })
        return [];
    }
}

export async function replyToMention(mentionId: string, botMessage: string) {
    try {

        if(!TWITTER_PRODUCTION){
            console.warn('Twitter API is not allowed');
            return null;
        }

        if (!botMessage) {
            console.error('Message is required to reply to mention');
            return null;
        }

        console.log("Replying to mention...");
        const replyResponse = await twitterClient.v2.reply(botMessage, mentionId);
        console.log(`Replied to mention: ${mentionId}`);

        return replyResponse.data;
    } catch (error: any) {
        console.error({
            message: "Reply twitter mention failure caught!",
            error_data: error.data,
            error_message: error?.message,
            error_stack: error?.stack
        })
        return null;
    }
}

export async function tweet(message: string, image_url: string | null = null) {
    try {

        if(!TWITTER_PRODUCTION){
            console.warn('Twitter API is not allowed');
            return null;
        }

        if (!message) {
            console.error('Message is required to tweet');
            return null;
        }

        var mediaID = null;
        if(image_url){
            console.log("Tweeting with image...");
            mediaID = await uploadImageToTwitter(image_url);
            console.log(`Uploaded image: ${mediaID}`);
        }

        console.log("Tweeting...");
        const tweetResponse = mediaID == null ? 
                                await twitterClient.v2.tweet(message) :
                                await twitterClient.v2.tweet({text: message, media: {media_ids: [String(mediaID)]}});
        console.log(`Tweeted: ${tweetResponse.data.id}`);

        return tweetResponse.data;
    } catch (error: any) {
        console.error({
            message: "Tweet message failure caught!",
            error_data: JSON.stringify(error.data),
            error_message: error?.message,
            error_stack: error?.stack
        })
        return null;
    }
}

export async function getTweets(user_id: string, start_time: number){
    try {

        const time = Number(start_time);
        const timestamp = (new Date(isNaN(time) ? start_time : time)).toISOString().split('.')[0]+"Z";
        //Implement logic for filtering tweets based on date range and pagination for influencers
        console.log(`Fetching Tweets for ${user_id}... from ${timestamp}`);
        const tweetsResponse = await twitterClient.v2.userTimeline(`${user_id}`, {
            max_results: 100, // You can set this to retrieve more mentions if needed, up to 100. Last 3200 available to paginate
            start_time: timestamp,
            'tweet.fields': 'created_at,author_id,entities,public_metrics'
        });

        if(tweetsResponse.data.data && tweetsResponse.data.data.length > 0){
            console.log(`Total ${tweetsResponse.data.data.length} mentions fetched`);
            return tweetsResponse.data.data;
        }
        
        return [];
    } catch (error : any) {
        console.error({
            message: "Fetch twitter mentions failure caught!",
            error_data: error.data,
            error_message: error?.message,
            error_stack: error?.stack
          })
        return [];
    }
}

