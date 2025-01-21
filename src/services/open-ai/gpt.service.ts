import { sleep } from "../../utils/sleep";
import { OpenAI } from 'openai';
import { MessageCreateParams, TextContentBlock } from "openai/resources/beta/threads/messages";
import fs from 'fs';
import axios from 'axios';
import { User } from "../../db/models/User";
import { gagsterPrompt } from "../../prompts/smart-meme-agent";

const artAssistantId = process.env.ART_ASSISTANT_ID!;
const socialAssistantId = process.env.SOCIAL_ASSISTANT_ID!;
const artModel = process.env.ART_MODEL!;
const IMAGE_SIZE = "1024x1024";

// Configure OpenAI with API key
const configuration = {
    apiKey: process.env.OPENAI_API_KEY!,
};

const ART_ASSISTANT_CONTEXT = gagsterPrompt;

const openai = new OpenAI(configuration);

/* ============================================================
  Function: Send Message to model and get response by running 
  a thread in the Assistant
============================================================ */
export async function sendMessage (user : User | null, message: string, artGeneration: boolean = true) {
    const text = user?.username ? `${message} @${user.username}` : message;
    const sendingMessage : MessageCreateParams = { role: 'user', content: text };

    // Initialize a new thread with the system message
    console.log("Sending message: [" + sendingMessage.content + "]");
    try {
        var thread_id = null;
        if(!user || !user.thread_id){
            console.log("Call to create thread");
            const thread = await openai.beta.threads.create();
            console.log("Thread created: " + thread.id);
            
            thread_id = thread.id;

        } else {
            thread_id = user.thread_id;
        }

        console.log("Call to create message");
        const botMessage = await openai.beta.threads.messages.create(
            thread_id,
            sendingMessage
            
          );
          console.log("Running thread "+ thread_id);
          //Model is definied in the assistant configuration
          let run = await openai.beta.threads.runs.createAndPoll(
            thread_id,
            { 
              assistant_id: artGeneration ? artAssistantId : socialAssistantId
            }
          );
        

          do{
            if (run.status === 'completed') {
                const messages = await openai.beta.threads.messages.list(
                    thread_id
                );

                const message = messages.data[0].content[0] as TextContentBlock;

                if(!message || !message?.text){
                    console.error({
                        message: `Error: No message returned from Agent`,
                    })
                    //returns null if message not present and the caller defines the behavior
                    return null;
                }

                if(user){
                    user.thread_id = thread_id;
                    await user.save();
                }
                
                return message.text.value.trim();
                
            }else if (
                run.status === 'failed' ||
                run.status === 'cancelled' ||
                run.status === 'expired'
            ) {
                console.error({
                    message: `Error: The run ended with status: ${run.status}`,
                })
                //returns null if there is an error and the caller defines the behavior
                return null;
            } else {
                console.log(run.status);
            }
            await sleep(500);
        } while (true);
        
    } catch (error: any) {
        console.error({
            message: "OpenAI sendMessage failure caught!",
            error_data: error.data,
            error_message: error?.message,
            error_stack: error?.stack
          })
          //returns null if there is an error and the caller defines the behavior
          return null;
    }
    
}

/* ============================================================
  Function: Create Image
============================================================ */
export async function createImage(prompt: string | null = null) {
    try {

        if(!artModel){
            //ignoring request if model is not defined
            console.error("ERROR: Art model not defined");
            return null;
        }
        const improvedPrompt = prompt ? 
                        `Create an image that represents the thoughts of the following tweet: "${prompt}"` :
                        `Generate a random meme. You don't know how to write. You NEVER depict any kind of text in the image. This is mandatory. 
${ART_ASSISTANT_CONTEXT}` ;
        const response = await openai.images.generate({
            model: artModel,
            prompt: improvedPrompt,
            n: 1,
            size: IMAGE_SIZE,
            });
        console.log(`image: ${JSON.stringify(response.data[0])}`);
        
        return response.data[0];
    } catch (error) {
        //returns null if there is an error and the caller defines the behavior
        console.error("createImage error: ", error);
        return null;
    }
    
}

/* ============================================================
  Function: Download Image
============================================================ */
export const download_image = async (url: string, image_path: string, retry: number = 0) : Promise<void> =>{
    try {
        await axios({
            url,
            responseType: 'stream',
          }).then(
            (response : any) =>
              new Promise((resolve, reject) => {
                response.data
                  .pipe(fs.createWriteStream(image_path))
                  .on('finish', () : any => { 
                      console.log("Image saved: ", image_path);    
                      return resolve(image_path) 
                  } )
                  .on('error', (e: any) => {
                      console.error("download_image error: ", e);
                      return reject(e)
                  } );
              }),
          );
    } catch (error) {
        console.error("download_image error: ", error);
        if(retry < 3){
            //wait one second retry 3 times if there is an error
            await sleep(1000);
            return download_image(url, image_path, retry + 1);
        }
    }
}
