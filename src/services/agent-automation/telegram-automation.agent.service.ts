import { TgMessage } from "../../db/models/TgMessage";
import { User } from "../../db/models/User";
import { TelegramUpdate, TgMessageAttributes } from "../../types/TelegramTypes";
import dotenv from 'dotenv';
import { categorizeMessage, getUpdates, replyToMessage } from "../telegram/telegram.service";
import { sendMessage } from "../open-ai/gpt.service";
import { TgChat } from "../../db/models/TgChat";
import { sleep } from "../../utils/sleep";
import { Activity, ActivityChannel, ActivityType } from "../../db/models/Activity";

dotenv.config();

const BOT_USERNAME = process.env.TG_BOT_USERNAME!;
const TG_SLEEP_TIME = 2000;

export const checkTgUpdates = async (): Promise<void> => {
    try {
        //get updates from telegram
        const updates = await getUpdates();

        if(updates.length > 0){
            console.log(`Found ${updates.length} updates`);
            await handleTgUpdates(updates);
        }
        
        
    } catch (error) {
        //ignore the error and continue to call from last point
        console.error(error);
    }

    await sleep(TG_SLEEP_TIME);
    await checkTgUpdates(); //recursive call to keep getting updates
}

//process telegram updates and take actions
const handleTgUpdates = async (updates: TelegramUpdate[]): Promise<void> => {
    try {
        var lastUpdateId = 0;
        for(const update of updates){
            lastUpdateId = update.update_id;
            const message = update.message || update.edited_message;

            const foundTgMessage = await TgMessage.findByPk(String(update?.update_id));

            if(!message || foundTgMessage){
                continue;
            }

            var messageText : string | null = null;
            if(message?.text){
                messageText = message.text;
            }

            var user = await User.findOne({where: {tg_id: String(message?.from?.id)}});

            if(!user){
                user = new User({id: `tg_${message?.from?.id}`, tg_id: String(message?.from?.id), tg_username: message?.from?.username});

                await user.save();

                const activity = new Activity(
                    {
                        type: ActivityType.NEW_USER,
                        channel: ActivityChannel.TELEGRAM,
                        user_id: user.id,
                        username: user.username,
                        timestamp: Date.now(),
                        
                    }
                );
                await activity.save();
            }

            const parsedMessage : TgMessageAttributes = {
                update_id: update.update_id,
                message_id: message?.message_id.toString(),
                chat_id: message?.chat.id.toString(),
                chat_name: message?.chat.title || message?.chat.username || '',
                chat_type: message?.chat.type,
                message_text: message?.text || '',
                message_type: categorizeMessage(message),
                bot_reply_text: '',
                user_name: message?.from ? `${message?.from.first_name}`.trim() : '',
                user_tg_id: message?.from!.id.toString()!,
                user_id: user.id,
                user_handle: message?.from?.username!,
                timestamp: message?.date,
            };

            switch (parsedMessage.message_type) {
                case 'MENTION':
                case 'PRIVATE':
                    //reply mention
                    if(messageText && user){
                        const botMessage = await sendMessage(user, messageText, false);
                        parsedMessage.bot_reply_text = botMessage || '';
                        if(botMessage && message?.chat?.id && message?.message_id){
                            await replyToMessage(message.chat.id, message.message_id, botMessage);
                            const activity = new Activity(
                                {
                                    type: ActivityType.INTERACTION,
                                    channel: ActivityChannel.TELEGRAM,
                                    user_id: user.id,
                                    username: user.username,
                                    message: messageText,
                                    reply: botMessage,
                                    timestamp: Date.now(),
                                    
                                }
                            );
                            await activity.save();
                        }
                    }
                    break;
                case 'REPLY':
                    //follow up on reply
                    if(message?.reply_to_message?.from?.username === BOT_USERNAME){
                        //parse message
                        if(messageText && user){
                            const botMessage = await sendMessage(user, messageText, false);
                            parsedMessage.bot_reply_text = botMessage || '';
                            if(botMessage && message?.chat?.id && message?.message_id){
                                await replyToMessage(message.chat.id, message.message_id, botMessage);
                                const activity = new Activity(
                                    {
                                        type: ActivityType.INTERACTION,
                                        channel: ActivityChannel.TELEGRAM,
                                        user_id: user.id,
                                        username: user.username,
                                        message: messageText,
                                        reply: botMessage,
                                        timestamp: Date.now(),
                                        
                                    }
                                );
                                await activity.save();
                            }
                        }
                    }
                    break;
                case 'NEW_USER':
                    if(message?.new_chat_participant || message?.new_chat_member){
                        if(message?.new_chat_participant?.username == BOT_USERNAME || 
                        message?.new_chat_member?.username == BOT_USERNAME) {
                            //Add new tgchat for bot messaging
                            var tgChat = await TgChat.findByPk(message.chat.id.toString());
                            if(!tgChat){
                                tgChat = new TgChat(
                                    {
                                        chat_id: message.chat.id.toString(), 
                                        chat_name: message.chat.title || message.chat.username || '', 
                                        chat_type: message.chat.type,
                                        enabled: true,
                                        join_date: new Date().getTime()
                                    }
                                );  
                            } else {
                                tgChat.enabled = true;
                                tgChat.join_date = new Date().getTime();
                            }

                            await tgChat.save();
                        }
                    }
                    break;
                case 'USER_LEFT':
                    if(message?.left_chat_member?.username == BOT_USERNAME){
                        //remove tgchat from bot messaging
                        var tgChat = await TgChat.findByPk(message.chat.id.toString());
                            if(!tgChat){
                                tgChat = new TgChat(
                                    {
                                        chat_id: message.chat.id.toString(), 
                                        chat_name: message.chat.title || message.chat.username || '', 
                                        chat_type: message.chat.type,
                                        enabled: true,
                                        join_date: new Date().getTime()
                                    }
                                );  
                            } else {
                                tgChat.enabled = false;
                                tgChat.leave_date = new Date().getTime();
                            }
                            
                            await tgChat.save();
                    }
                    break;  
                default:
                    break;
            }

            const tgMessage = new TgMessage(parsedMessage);
            await tgMessage.save();

            user.tg_id = String(message?.from?.id);
            user.tg_username = parsedMessage.user_name!;
            await user.save();

        }

        //Make sure we are saving the last update id for tracking tg pagination
        const lastMessage = await TgMessage.findOne({ order: [['timestamp', 'DESC']] });
            
        if(lastMessage && Number(lastMessage.update_id) < lastUpdateId){
            lastMessage.update_id = String(lastUpdateId);
            await lastMessage.save();
        }
    } catch (error) {
        //log error and continue processing the next messages
        console.error("handleTgUpdates error: ",error);
    }
    return;
};