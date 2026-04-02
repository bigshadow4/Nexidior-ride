import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import "dotenv/config";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
    .setTitle('Nexidior Ride')
    .setDescription('Documentation of APIs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document); // L'URL sera http://localhost:3000/api/docs

    app.enableCors({ origin: true, credentials: true, methods: 'GET,HEAD,PUT,PATCH,POST,DELETE' })
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
