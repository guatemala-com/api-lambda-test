import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
// --- LÍNEA MODIFICADA ---
// Cambiamos el 'import' por 'require' para asegurar la compatibilidad
const serverlessExpress = require('@codegenie/serverless-express');
// -------------------------
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
    // Esta línea ahora funcionará correctamente con la nueva importación
    cachedServer = serverlessExpress({ app: expressApp });
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