"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    jwt: {
        secret: process.env.JWT_SECRET,
    },
    database: {
        connectionString: process.env.MONGO_URL,
    },
    panns: {
        baseUrl: process.env.PANNS_API_URL || 'http://localhost:8002',
    },
});
//# sourceMappingURL=config.js.map