/**
 * "/health" routes
 */
import { Router, Request, Response } from 'express';

export const healthRouter = Router();

/**
 * @swagger
 * /api/status/health:
 *   get:
 *     summary: Health status endpoint
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Application in good conditions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                 error:
 *                   type: string
 *               required:
 *                 - error
 */
healthRouter.get('/health', async (req: Request, res: Response) => {
    return res.status(200).json({success: true});
});
