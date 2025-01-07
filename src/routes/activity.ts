import { Router, Request, Response } from 'express';
import {INTERNAL_SERVER_ERROR_500} from "../constants/httpStatusCodes";
import { Mention } from '../db/models/Mention';
import { Op } from 'sequelize';
import { Activity } from '../db/models/Activity';
import { Artwork } from '../db/models/Artwork';

export const dataRouter = Router();

/**
 * @swagger
 * /api/data/activity/{timestamp}:
 *   get:
 *     summary: Get last activity since a given timestamp
 *     tags:
 *       - Activity
 *     parameters:
 *       - in: path
 *         name: timestamp
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Success.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                    activity:
 *                      items:
 *                        type: object
 *                    last_timestamp:
 *                      type: number
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
 *                 errors:
 *                   type: array
 *               required:
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
dataRouter.get('/activity/:timestamp', async (req: Request, res: Response) => {

  const timestamp = Number(req.params.timestamp);
  var limit = Number(req.query.limit) || 10;

  //caps the api to max 100 results
  if (limit > 100) {
    limit = 100;
  } else if (isNaN(limit)) {
    limit = 10;
  }

  try {

      const activities = await Activity.findAll({ where: { timestamp: { [Op.gte]: timestamp }  }, limit: limit, order: [['timestamp', 'ASC']] });

      const lastTimestamp = activities.length > 0 ? activities[activities.length - 1].timestamp : timestamp;

      const response = {
        activity: activities,
        last_timestamp: lastTimestamp
      }

      res.json({
        success: true,
        data: response,
        errors: ''
      });
      return

  } catch (e: any) {
    console.error({
      message: "Get activity data failure caught!",
      error_message: e?.message,
      error_stack: e?.stack,
      timestamp,
      limit
    })
    return res.status(INTERNAL_SERVER_ERROR_500).json({errors: "Internal Server Error"})
  }
})

/**
 * @swagger
 * /api/data/artwork/{timestamp}:
 *   get:
 *     summary: Get last artwork since a given timestamp
 *     tags:
 *       - Activity
 *     parameters:
 *       - in: path
 *         name: timestamp
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Success.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                    activity:
 *                      items:
 *                        type: object
 *                    last_timestamp:
 *                      type: number
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
 *                 errors:
 *                   type: array
 *               required:
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
dataRouter.get('/artwork/:timestamp', async (req: Request, res: Response) => {

  const timestamp = Number(req.params.timestamp);
  var limit = Number(req.query.limit) || 10;

  //caps the api to max 100 results
  if (limit > 100) {
    limit = 100;
  } else if (isNaN(limit)) {
    limit = 10;
  }

  try {

      const activities = await Artwork.findAll({ where: { created_at: { [Op.lte]: timestamp }  }, limit: limit, order: [['created_at', 'DESC']] });

      const lastTimestamp = activities.length > 0 ? activities[activities.length - 1].created_at.getTime() : timestamp;

      const response = {
        activity: activities,
        last_timestamp: lastTimestamp
      }

      res.json({
        success: true,
        data: response,
        errors: ''
      });
      return

  } catch (e: any) {
    console.error({
      message: "Get artwork data failure caught!",
      error_message: e?.message,
      error_stack: e?.stack,
      timestamp,
      limit
    })
    return res.status(INTERNAL_SERVER_ERROR_500).json({errors: "Internal Server Error"})
  }
})