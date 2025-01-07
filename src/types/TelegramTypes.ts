  export interface TelegramUpdate {
    update_id: number;
    message?: TelegramMessage;
    edited_message?: TelegramMessage;
  }
  
  export interface TelegramMessage {
    message_id: number;
    from?: TelegramUser;
    chat: TelegramChat;
    date: number;
    text?: string;
    new_chat_participant?: TelegramUser;
    new_chat_member?: TelegramUser;
    left_chat_member?: TelegramUser;
    reply_to_message?: TelegramMessage;
  }
  
  export interface TelegramUser {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
  }
  
  export interface TelegramChat {
    id: number;
    type: string;
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  }
  
  export interface TgMessageAttributes {
    update_id: number;
    chat_id: string;
    message_id: string;
    user_tg_id: string;
    user_id?: string;
    chat_name: string;
    chat_type: string;
    message_text?: string;
    message_type?: string;
    bot_reply_text?: string;
    user_name?: string;
    user_handle?: string;
    timestamp: number;
  }