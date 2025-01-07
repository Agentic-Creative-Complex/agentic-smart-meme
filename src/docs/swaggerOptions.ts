export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Meme Agent API',
      version: '1.0.0',
      description: 'Meme Agent API',
    },
  },
  apis: ['./src/routes/*'],  // point to the routes files where the JSDoc comments are
};
