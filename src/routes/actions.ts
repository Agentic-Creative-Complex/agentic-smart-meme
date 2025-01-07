import { Router, Request, Response } from 'express';
import {BAD_REQUEST_400, INTERNAL_SERVER_ERROR_500} from "../constants/httpStatusCodes";
import { tweet } from '../services/twitter/twitter.service';
import { sendMessage } from '../services/open-ai/gpt.service';
import { User } from '../db/models/User';
import { Op } from 'sequelize';
import { Activity, ActivityChannel, ActivityType } from '../db/models/Activity';

export const actionsRouter = Router();

/**
 * @swagger
 * /api/actions/tweet:
 *   post:
 *     summary: Tweet message
 *     tags:
 *       - Tweet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *             required:
 *               - message
 *             example:
 *               message: "Hello world!"
 *     responses:
 *       200:
 *         description: An object that contains a "success" boolean indicating creation status and the blockchain object created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: string
 *                   description: Tweet id.
 *                 errors:
 *                   type: string
 *               required:
 *                 - success
 *       400:
 *         description: Bad Request.
 *         # The 400 response is formatted and sent by the express-openapi-validator middleware (In most cases).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: string
 *                       message:
 *                         type: string
 *                       errorCode:
 *                         type: string
 *                     required:
 *                       - path
 *                       - message
 *                       - errorCode
 *               required:
 *                 - message
 *                 - errors
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: string
 *               required:
 *                 - error
 */
actionsRouter.post('/tweet', async (req: Request, res: Response) => {
  // get request body
  const message  = req.body.message;
  return res.status(BAD_REQUEST_400).json({ status: BAD_REQUEST_400, message: 'Bad request body' }); 
  try {

    if(!req.body || !req.body.message){
      return res.status(BAD_REQUEST_400).json({ status: BAD_REQUEST_400, message: 'Bad request body' }); 
    }

    const tweetResponse = await tweet(message);

    // format response
    const response = {
      success: tweetResponse ? true : false,
      data: tweetResponse ? tweetResponse.id : '',
      errors: tweetResponse ? '' : 'Error tweeting message'
    }

  

    res.json(response);

  } catch (e: any) {
    console.error({
      message: "Delete price sync contract failure caught!",
      error_message: e?.message,
      error_stack: e?.stack,
      tweetMessage: message
    })
    return res.status(INTERNAL_SERVER_ERROR_500).json({errors: "Internal Server Error"})
  }
})

/**
 * @swagger
 * /api/actions/chat:
 *   post:
 *     summary: Post a chat message for the bot to respond to
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: Twitter user id or handle(username).
 *               message:
 *                 type: string
 *                 description: Chat Message.
 *               wallet_address:
 *                 type: string
 *                 description: Wallet address.
 *             required:
 *               - user_id
 *               - message
 *             example:
 *               user_id: "123456789"
 *               message: "Hello world!"
 *               wallet_address: "0x1234567891234567891234567891234567891234"             
 *     responses:
 *       200:
 *         description: An object that contains a "success" boolean indicating creation status and the blockchain object created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: string
 *                   description: Bot answer.
 *                 errors:
 *                   type: string
 *               required:
 *                 - success
 *       400:
 *         description: Bad Request.
 *         # The 400 response is formatted and sent by the express-openapi-validator middleware (In most cases).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: string
 *                       message:
 *                         type: string
 *                       errorCode:
 *                         type: string
 *                     required:
 *                       - path
 *                       - message
 *                       - errorCode
 *               required:
 *                 - message
 *                 - errors
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: string
 *               required:
 *                 - error
 */
actionsRouter.post('/chat', async (req: Request, res: Response) => {
  // get request body
  const message  = req.body.message;
  const userId  = req.body.user_id;
  const walletAddress  = req.body.wallet_address;

  try {

    if(!req.body || !req.body.message || !req.body.user_id){
      return res.status(BAD_REQUEST_400).json({ status: BAD_REQUEST_400, message: 'Bad request body' }); 
    }

    var user = await User.findOne({where: { [Op.or]: [{id: userId}, {username: userId}] }});

    if(!user){
      user = new User();
      user.id = userId;
      user.wallet_addresses = [];
      user.wallet_addresses.push(walletAddress);
      await user.save();
    }

    if(user && walletAddress){
      if(!user.wallet_addresses){
        user.wallet_addresses = [];
      }

      if(!user.wallet_addresses.includes(walletAddress)){
        user.wallet_addresses.push(walletAddress);
        await user.save();
      }

    }

    const answer = await sendMessage(user, message, false);

    const activity = new Activity(
      {
          type: ActivityType.INTERACTION,
          channel: ActivityChannel.TERMINAL,
          user_id: user.id,
          username: user.username,
          message: message,
          reply: answer || '',
          timestamp: Date.now(),
      }
    );
    await activity.save();

    // format response
    const response = {
      success: answer ? true : false,
      data: answer ? answer : '',
      errors: answer ? '' : 'Error processing message'
    }

    res.json(response);

  } catch (e: any) {
    console.error({
      message: "Chatting failure caught!",
      error_message: e?.message,
      error_stack: e?.stack,
      user_id: userId,
      chatMessage: message
    })
    return res.status(INTERNAL_SERVER_ERROR_500).json({errors: "Internal Server Error"})
  }
})

/**
 * @swagger
 * /api/actions/generate:
 *   post:
 *     summary: Post a prompt for generating a response
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Prompt Message.
 *             required:
 *               - prompt
 *             additionalProperties: false
 *             example:
 *               prompt: "Hello world!" 
 *     responses:
 *       200:
 *         description: An object that contains a "success" boolean indicating creation status and the blockchain object created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: string
 *                   description: Bot answer.
 *                 errors:
 *                   type: string
 *               required:
 *                 - success
 *       400:
 *         description: Bad Request.
 *         # The 400 response is formatted and sent by the express-openapi-validator middleware (In most cases).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: string
 *                       message:
 *                         type: string
 *                       errorCode:
 *                         type: string
 *                     required:
 *                       - path
 *                       - message
 *                       - errorCode
 *               required:
 *                 - message
 *                 - errors
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: string
 *               required:
 *                 - error
 */
actionsRouter.post('/generate', async (req: Request, res: Response) => {
  // get request body
  const message  = req.body.prompt;

  try {
    return res.status(BAD_REQUEST_400).json({ status: BAD_REQUEST_400, message: 'Bad request body' }); 
    if(!req.body || !req.body.prompt){
      return res.status(BAD_REQUEST_400).json({ status: BAD_REQUEST_400, message: 'Bad request body' }); 
    }

    const answer = await sendMessage(null, message);

    // format response
    const response = {
      success: answer ? true : false,
      data: answer ? answer : '',
      errors: answer ? '' : 'Error processing prompt'
    }

    res.json(response);

  } catch (e: any) {
    console.error({
      message: "Generating message failure caught!",
      error_message: e?.message,
      error_stack: e?.stack,
      prompt: message
    })
    return res.status(INTERNAL_SERVER_ERROR_500).json({errors: "Internal Server Error"})
  }
})
