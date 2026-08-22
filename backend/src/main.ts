import './register-alias';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from '@/app.module';
import { HttpResponseFilter } from '@/filters/http-response.filter';
import { HttpResponseInterceptor } from '@/interceptors/http-response.interceptor';
import { RequestValidationPipe } from '@/pipes/request-validation.pipe';
import { AppLoggerService } from '@/shared-modules/logging/app-logger.service';

/** 创建 HTTP 服务、Swagger 文档和统一可观测性组件。 */
export async function bootstrap(options: { listen?: boolean } = {}) {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(AppLoggerService);
  const swaggerEnabled =
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_SWAGGER === 'true';
  const expressApp = app.getHttpAdapter().getInstance() as {
    set(name: string, value: unknown): void;
  };

  app.useLogger(logger);
  app.flushLogs();
  app.setGlobalPrefix('api');
  expressApp.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS || 1));
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          scriptSrc: swaggerEnabled
            ? ["'self'", "'unsafe-inline'"]
            : ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
    }),
  );
  app.use(cookieParser());
  app.useGlobalPipes(new RequestValidationPipe());
  app.useGlobalFilters(new HttpResponseFilter(logger));
  app.useGlobalInterceptors(new HttpResponseInterceptor(logger));

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('日本語言葉勉強 API')
      .setDescription('个人日语知识库、学习、复习与管理接口')
      .setVersion('1.0')
      .addCookieAuth('jvs_session')
      .build();
    SwaggerModule.setup(
      'api/docs',
      app,
      SwaggerModule.createDocument(app, swaggerConfig),
    );
  }

  const port = Number(process.env.PORT || 3000);
  const localUrl = `http://localhost:${port}`;
  const swaggerUrl = `${localUrl}/api/docs`;

  if (options.listen !== false) {
    await app.listen(port, '0.0.0.0');
  } else {
    await app.init();
  }

  logger.log(`server is running at ${localUrl}`);
  if (swaggerEnabled) logger.log(`server docs is running at ${swaggerUrl}`);

  logger.startup('Service started', {
    apiDocumentationUrl: swaggerEnabled ? swaggerUrl : undefined,
    localUrl,
    logFile: logger.filePath,
  });

  return app;
}

if (!process.env.VERCEL_FUNCTION) void bootstrap();
