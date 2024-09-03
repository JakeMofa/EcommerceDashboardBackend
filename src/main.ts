import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './middlewares/exception.interceptor';
import * as basicAuth from 'express-basic-auth';
import { writeFileSync } from 'fs';
import { ValidationExceptionFilter } from './middlewares/exception.middleware';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: ['log', 'debug', 'error', 'verbose', 'warn'],
  });
  app.use(compression());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new ValidationExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });
  const swagger_user: string | undefined = process.env.SWAGGER_USER;
  const swagger_password: string | undefined = process.env.SWAGGER_PASSWORD;
  if (!swagger_user || !swagger_password) throw new Error('SWAGGER_USER and SWAGGER_PASSWORD must be set');
  app.use(
    ['/docs', '/docs-json'],
    basicAuth({
      users: { [swagger_user]: swagger_password },
      challenge: true,
    }),
  );
  const options = new DocumentBuilder().setTitle('Vendo API').setVersion('1.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  if (process.env.NODE_ENV !== 'production') writeFileSync('./swagger-spec.json', JSON.stringify(document, null, 2));

  await app.listen(3000);
}

bootstrap();

(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};
