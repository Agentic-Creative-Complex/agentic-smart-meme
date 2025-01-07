/**
 * Smart Meme API entry point
 */
import dotenv from "dotenv";
dotenv.config();
// Assure that dotenv is setup before importing the logger. And then immedialey import the logger so formatted messages are sent to cloudwatch
import * as CONSTANTS from './config/constants';
import express from 'express';
import {Sequelize} from "sequelize-typescript";
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import {orderSwaggerPaths} from "./docs/orderSwaggerPaths";
import {swaggerOptions} from "./docs/swaggerOptions";
import * as OpenApiValidator from 'express-openapi-validator';
import {healthRouter} from "./routes/health";
import {INTERNAL_SERVER_ERROR_500} from "./constants/httpStatusCodes";
import {actionsRouter} from "./routes/actions";
import {dataRouter} from "./routes/activity";
import { User } from './db/models/User';
import { Mention } from './db/models/Mention';
import {setSequelizeInstance} from "./utils/sequelizeInstance";
import {
  getAndReplyRecentMentions,
  createRandomPiece,
  postRandomMessage
} from "./services/agent-automation/twitter-automation.agent.service";
import cors from 'cors';
import { checkTgUpdates } from "./services/agent-automation/telegram-automation.agent.service";
import { TgChat } from "./db/models/TgChat";
import { TgMessage } from "./db/models/TgMessage";
import { Activity } from "./db/models/Activity";
import { Artwork } from "./db/models/Artwork";
const path = require('path')


const app = express();

app.use(cors({
  origin: '*', // Allow all origins - customize this in production!
  methods: '*',
  allowedHeaders: '*',
}));

app.use(express.json()); // Middleware for parsing JSON request bodies

// Set up Swagger and generate API documentation
const swaggerSpec = swaggerJsDoc(swaggerOptions) as any;
swaggerSpec.paths = orderSwaggerPaths(swaggerSpec.paths);

app.use('/api-images', express.static(__dirname + '/public'))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Mount the routers
app.use('/api/status', healthRouter);
app.use('/api/actions', actionsRouter);
app.use('/api/data', dataRouter);

// Use OpenAPI Validator to validate incoming requests and responses
app.use(OpenApiValidator.middleware({
  apiSpec: swaggerSpec,
  validateRequests: false,
  validateResponses: false
}));

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.warn({
    message: "Route not found",
    error_message: err.message,
    error_stack: err.stack,
    errors: err.errors
  })
  res.status(err.status || INTERNAL_SERVER_ERROR_500).json({
    message: err.message,
    errors: err.errors,
  });
});

const sequelize = new Sequelize(
  CONSTANTS.POSTGRES_DB_NAME!,
  CONSTANTS.POSTGRES_USERNAME!,
  CONSTANTS.POSTGRES_PASSWORD,{
    host: CONSTANTS.POSTGRES_HOST,
    port: Number(CONSTANTS.POSTGRES_PORT),
    dialect: CONSTANTS.SEQUELIZE_DIALECT,
    logging: false
  }
);

sequelize.addModels([
  User,
  Mention,
  TgChat,
  TgMessage,
  Activity,
  Artwork
]);

setSequelizeInstance(sequelize);

app.listen(CONSTANTS.EXPRESS_PORT, () => {
  console.log(`Smart Meme bot agent API server started on port ${CONSTANTS.EXPRESS_PORT}`);

  const MENTION_CHECK_INTERVAL_MINUTES = Number(process.env.MENTION_CHECK_INTERVAL_MINUTES) || 6;
  const POST_INTERVAL_MINUTES = Number(process.env.POST_INTERVAL_MINUTES) || 30;

  // Run the function to fetch mentions
  const TWITTER_ALLOWED = process.env.TWITTER_ALLOWED == "1";//allows tweet posts
  const REPLY_ALLOWED = process.env.REPLY_ALLOWED == "1";//allows tweet replies
  const TG_ALLOWED: boolean = process.env.TG_ALLOWED == "1";//allows telegram messages
  const ART_ASSISTANT_ALLOWED = process.env.ART_ASSISTANT_ALLOWED == "1";//allows art assistant

  if(REPLY_ALLOWED){
    getAndReplyRecentMentions();
  }
  
  if(TWITTER_ALLOWED){
    console.log("Starting posting scheduler");
    // // Run the function to automatic post tweets
    if(ART_ASSISTANT_ALLOWED){
      //post art pieces
      setInterval(async()=>await createRandomPiece(), 1000*60*POST_INTERVAL_MINUTES);
      createRandomPiece();
    } else{
      //post regular tweets
      postRandomMessage();
      setInterval(async()=>await postRandomMessage(), 1000*60*POST_INTERVAL_MINUTES);
    }
    
  }

  if(TG_ALLOWED){
    // // Run the function to fetch telegram updates
    checkTgUpdates();
  }
  

});
