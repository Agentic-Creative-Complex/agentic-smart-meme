import { Telegraf } from "telegraf";
import axios from 'axios';
import dotenv from 'dotenv';
import { TgMessage } from "../../db/models/TgMessage";
import { TgChat } from "../../db/models/TgChat";
import { TelegramMessage, TelegramUpdate } from "../../types/TelegramTypes";

dotenv.config();

const TG_ALLOWED = process.env.TG_ALLOWED == "1";
const TG_PRODUCTION = process.env.TG_PRODUCTION == "1";
const BOT_TOKEN = process.env.TG_BOT_TOKEN!;
const BOT_USERNAME = process.env.TG_BOT_USERNAME!;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

//post message to telegram all channels the bot is in
export async function postOnTgChannels(message: string, image: string | null = null): Promise<void> {
    if (!TG_ALLOWED) {
      console.log('Telegram is not allowed');
      return;
    }

    try {
      const chats = await TgChat.findAll({ where: { enabled: true } });

      for (const chat of chats) {
          await sendTelegramMessage(message, image, chat.chat_id);
      }
    } catch (error) {
        console.error('Error sending TG messages:', error);
    }
    
    return;
   
}
 
// Function to send a message via Telegram API.
export async function sendTelegramMessage(message: string, image: string | null = null, chatId: string): Promise<void> {
  
  try {
    
    if (!TG_PRODUCTION) {
      console.log('Telegram is not allowed');
      return;
    }
    
    const bot = new Telegraf(BOT_TOKEN);
    
    if(image){
        await bot.telegram.sendPhoto(chatId, { url: image }, { caption: message });
    } else {
        bot.telegram.sendMessage(chatId, message);
    }
  } catch (error) {
    console.error('Error sending TG message:', error);
  }

  return;
    
}

// Function to fetch updates from Telegram API.
export const getUpdates = async (): Promise<TelegramUpdate[]> => {
    try {

        if (!TG_ALLOWED) {
            console.log('Telegram is not allowed');
            return [];
        }

        const lastMessage = await TgMessage.findOne({ order: [['timestamp', 'DESC']] });

        //be careful with this, once we fetch the last update_id we should save it in the db and tg will stop returning updates before that id
        var lastUpdateId = lastMessage?.update_id || "0"; 

        const response = await axios.get(TELEGRAM_API_URL + `/getUpdates?offset=${lastUpdateId}&limit=100`);

        return response.data.result || [];
       
    } catch (error) {
      console.error('Error fetching updates:', error);
      return [];
    }
  };


// Function to reply to a message via Telegram API.
export const replyToMessage = async (chatId: number, messageId: number, text: string): Promise<void> => {
    try {

      if (!TG_PRODUCTION) {
          console.log('Telegram is not allowed');
          return;
      }

      await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
        chat_id: chatId,
        reply_to_message_id: messageId,
        text,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
    return;
};


// Function to categorize a message based on its content.
export const categorizeMessage = (originalMessage?: TelegramMessage): string => {
  try {
    if (!originalMessage) return 'UNKNOWN';

    if (originalMessage.text && originalMessage.text.includes(BOT_USERNAME)) {
      return 'MENTION';
    }

    if (originalMessage.reply_to_message && originalMessage.reply_to_message.from?.username === BOT_USERNAME) {
      return 'REPLY';
    }

    if (originalMessage.new_chat_participant || originalMessage.new_chat_member) {
      return 'NEW_USER';
    }

    if(originalMessage.left_chat_member){
      return 'USER_LEFT';
    }

    if(originalMessage.chat.type === 'private'){
      return 'PRIVATE';
    }

    return 'OTHER';
  } catch (error) {
    console.error('Error categorizing message:', error);
    return 'UNKNOWN';
    
  }
  
};


