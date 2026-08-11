import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from '@/app.module';
import { HttpResponseFilter } from '@/filters/http-response.filter';
import { HttpResponseInterceptor } from '@/interceptors/http-response.interceptor';
import { RequestValidationPipe } from '@/pipes/request-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(new RequestValidationPipe());
  app.useGlobalFilters(new HttpResponseFilter());
  app.useGlobalInterceptors(new HttpResponseInterceptor());

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

  await app.listen(Number(process.env.PORT || 3000), '0.0.0.0');
}
void bootstrap();
