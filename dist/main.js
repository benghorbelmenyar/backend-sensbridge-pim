"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const axios_1 = __importDefault(require("axios"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('SenseBridge Backend APIs')
        .setDescription('NestJS Auth API + Gloss + PANNs')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const nestDocument = swagger_1.SwaggerModule.createDocument(app, config);
    const glossOpenApiUrl = `${process.env.GLOSS_API_URL || 'http://localhost:8000'}/openapi.json`;
    const pannsOpenApiUrl = `${process.env.PANNS_API_URL || 'http://localhost:8002'}/openapi.json`;
    const combinedDocument = {
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
            const res = await axios_1.default.get(svc.url, { timeout: 5000 });
            const doc = res.data || {};
            if (doc.paths) {
                combinedDocument.paths = {
                    ...combinedDocument.paths,
                    ...doc.paths,
                };
            }
            if (Array.isArray(doc.tags)) {
                combinedDocument.tags.push(...doc.tags.map((t) => ({
                    ...t,
                    name: `${svc.name}.${t.name}`,
                })));
            }
            if (doc.components?.schemas) {
                combinedDocument.components.schemas = {
                    ...combinedDocument.components.schemas,
                    ...doc.components.schemas,
                };
            }
        }
        catch (error) {
            console.warn(`Could not load OpenAPI from ${svc.name} at ${svc.url}:`, error.message ?? String(error));
        }
    }
    swagger_1.SwaggerModule.setup('api', app, combinedDocument);
    await app.listen(process.env.PORT ?? 4004);
}
bootstrap();
//# sourceMappingURL=main.js.map