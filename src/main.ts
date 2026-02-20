import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = process.env.PORT || 3000;
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Education Mart')
    .setDescription('The Education Mart API description')
    .setVersion('1.0')
    .addTag('education-mart')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, documentFactory);
  await app.listen(`${port}`);
  console.log(
    `Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
  console.log(
    `Swagger docs available at: http://localhost:${port}/${apiPrefix}/docs`,
  );
}
bootstrap();
