import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import serverlessExpress from '@codegenie/serverless-express';
import type {
  Handler,
  Context,
  Callback,
  APIGatewayProxyResult,
  APIGatewayProxyEvent,
} from 'aws-lambda';
import * as express from 'express';

let cachedServer: Handler;

async function bootstrapServer(): Promise<Handler> {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    await nestApp.init();
    cachedServer = serverlessExpress({ app: expressApp }).handler;
  }

  return cachedServer;
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback,
): Promise<APIGatewayProxyResult> => {
  const server = await bootstrapServer();

  return server(event, context, callback) as Promise<APIGatewayProxyResult>;
};

// Opcional: Para desarrollo local (si quieres ejecutarlo con `node dist/lambda.js`)
// Ten en cuenta que para desarrollo local con NestJS lo ideal es usar `npm run start:dev`
// y mantener `main.ts` para esa configuración.
// if (process.env.NODE_ENV === 'local') {
//   bootstrapServer().then((server) => {
//     console.log('NestJS app running locally with serverless-express (emulated)');
//   });
// }
