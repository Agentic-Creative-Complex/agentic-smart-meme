import fs from 'fs';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import OAuth from 'oauth-1.0a';
dotenv.config();

const MEDIA_ENDPOINT_URL = 'https://upload.twitter.com/1.1/media/upload.json';

const CONSUMER_KEY = process.env.TWITTER_API_KEY || '';
const CONSUMER_SECRET = process.env.TWITTER_API_SECRET_KEY || '';
const ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN || '';
const ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET || '';

class TwitterMediaUploader {
  /**
   * Creates an instance of TwitterMediaUploader.
   */
  constructor() {}

  /**
   * Uploads media to Twitter.
   *
   * @param {string} filePath - The path to the media file.
   * @param {string} mediaCategory - The category of the media.
   * @returns {Promise<void>} - A promise that resolves after the upload is complete.
   */
  async uploadMedia(filePath: string, mediaCategory: string) {

    try {

      const fileData = fs.readFileSync(filePath, { encoding: 'base64' });
      const formData = new FormData();
      formData.append('media_data', fileData);
      formData.append('media_category', mediaCategory);
      const oauth = new OAuth({
        consumer: {
          key: CONSUMER_KEY,
          secret: CONSUMER_SECRET
        },
        signature_method: 'HMAC-SHA1',
        hash_function: function (base_string: any, key: any) {
          return crypto.createHmac('sha1', key).update(base_string).digest('base64');
        }
      });
      const authHeader = oauth.toHeader(oauth.authorize({ url: MEDIA_ENDPOINT_URL, method: 'POST' }, { key: ACCESS_TOKEN, secret: ACCESS_TOKEN_SECRET }));

      const requestData = {
        url: MEDIA_ENDPOINT_URL,
        data: formData,
        headers: {
          Authorization: authHeader.Authorization,
          'Content-Type': 'multipart/form-data'
        }
      };

      console.log('Uploading media');
      const response = await axios.post(requestData.url, requestData.data, { headers: requestData.headers });
      const mediaID = response.data.media_id_string;
      return mediaID;
    } catch (error) {
      console.error('uploadMedia error: ', error);
      return null;
    }
  }
}

/**
 * Uploads an image to Twitter.
 *
 * @returns {Promise<void>} - A promise that resolves after the upload is complete.
 */
export async function uploadImageToTwitter(imageUrl: string) {
  try {
    const twitterUploader = new TwitterMediaUploader();
    const response = await twitterUploader.uploadMedia(imageUrl, 'tweet_image');
    console.log(response);
    return response;
  } catch (error) {
    console.error('uploadImageToTwitter error: ',error);
  }
  
}