import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from '@/app.module';
import { HttpResponseFilter } from '@/filters/http-response.filter';
import { HttpResponseInterceptor } from '@/interceptors/http-response.interceptor';
import { RequestValidationPipe } from '@/pipes/request-validation.pipe';
import { AppLoggerService } from '@/shared-modules/logging/app-logger.service';

/** 创建 HTTP 服务、Swagger 文档和统一可观测性组件。 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(AppLoggerService);

  app.useLogger(logger);
  app.flushLogs();
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(new RequestValidationPipe());
  app.useGlobalFilters(new HttpResponseFilter(logger));
  app.useGlobalInterceptors(new HttpResponseInterceptor(logger));

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

  const port = Number(process.env.PORT || 3000);
  const localUrl = `http://localhost:${port}`;
  const swaggerUrl = `${localUrl}/api/docs`;

  await app.listen(port, '0.0.0.0');

  logger.log(`server is running at ${localUrl}`);
  logger.log(`server docs is running at ${swaggerUrl}`);

  logger.startup('Service started', {
    apiDocumentationUrl: swaggerUrl,
    localUrl,
    logFile: logger.filePath,
  });
}

void bootstrap();
