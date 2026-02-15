import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import axios from 'axios';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('SenseBridge Backend APIs')
    .setDescription('NestJS Auth API + Gloss + PANNs')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();
  const nestDocument = SwaggerModule.createDocument(app, config);

  // Try to fetch and merge FastAPI (gloss + panns) OpenAPI docs into a combined document
  const glossOpenApiUrl = `${process.env.GLOSS_API_URL || 'http://localhost:8000'}/openapi.json`;
  const pannsOpenApiUrl = `${process.env.PANNS_API_URL || 'http://localhost:8002'}/openapi.json`;

  const combinedDocument: any = {
    ...nestDocument,
    paths: { ...(nestDocument.paths || {}) },
    components: {
      ...(nestDocument.components || {}),
      schemas: { ...(nestDocument.components?.schemas || {}) },
    },
    tags: [...(nestDocument.tags || [])],
  };

  const externalSpecs = [
    { name: 'gloss', url: glossOpenApiUrl },
    { name: 'panns', url: pannsOpenApiUrl },
  ];

  for (const svc of externalSpecs) {
    try {
      const res = await axios.get(svc.url, { timeout: 5000 });
      const doc = res.data || {};

      // Merge paths
      if (doc.paths) {
        combinedDocument.paths = {
          ...combinedDocument.paths,
          ...doc.paths,
        };
      }

      // Merge tags (prefix with service name to avoid collisions)
      if (Array.isArray(doc.tags)) {
        combinedDocument.tags.push(
          ...doc.tags.map((t: any) => ({
            ...t,
            name: `${svc.name}.${t.name}`,
          })),
        );
      }

      // Merge schemas if present
      if (doc.components?.schemas) {
        combinedDocument.components.schemas = {
          ...combinedDocument.components.schemas,
          ...doc.components.schemas,
        };
      }
    } catch (error) {
      // If a service is not up yet, just skip it for the combined doc
      // eslint-disable-next-line no-console
      console.warn(
        `Could not load OpenAPI from ${svc.name} at ${svc.url}:`,
        (error as any).message ?? String(error),
      );
    }
  }

  // Combined Swagger UI (Nest + gloss + PANNs) at /api
  SwaggerModule.setup('api', app, combinedDocument);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();