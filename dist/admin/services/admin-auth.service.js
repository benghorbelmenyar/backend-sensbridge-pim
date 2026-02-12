"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const nanoid_1 = require("nanoid");
const admin_schema_1 = require("../schemas/admin.schema");
let AdminAuthService = class AdminAuthService {
    adminModel;
    jwtService;
    constructor(adminModel, jwtService) {
        this.adminModel = adminModel;
        this.jwtService = jwtService;
    }
    async validateAdmin(email, password) {
        const admin = await this.adminModel.findOne({ email, isActive: true });
        if (!admin) {
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        admin.lastLogin = new Date();
        await admin.save();
        return admin;
    }
    async login(email, password) {
        const admin = await this.validateAdmin(email, password);
        const payload = {
            sub: admin._id,
            email: admin.email,
            role: admin.role,
        };
        return {
            access_token: this.jwtService.sign(payload),
            admin: {
                id: admin._id,
                email: admin.email,
                role: admin.role,
            },
        };
    }
    async createAdmin(email, password, role = 'admin') {
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new this.adminModel({
            email,
            password: hashedPassword,
            role,
        });
        return admin.save();
    }
    async register(dto) {
        const existing = await this.adminModel.findOne({ email: dto.email });
        if (existing) {
            throw new common_1.ConflictException('Cet email est déjà utilisé');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const admin = new this.adminModel({
            email: dto.email,
            password: hashedPassword,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: dto.role || 'admin',
        });
        const saved = await admin.save();
        const { password: _, ...result } = saved.toObject();
        return result;
    }
    async changePassword(id, dto) {
        const admin = await this.adminModel.findById(id);
        if (!admin) {
            throw new common_1.UnauthorizedException('Admin non trouvé');
        }
        const isCurrentValid = await bcrypt.compare(dto.currentPassword, admin.password);
        if (!isCurrentValid) {
            throw new common_1.BadRequestException('Mot de passe actuel incorrect');
        }
        admin.password = await bcrypt.hash(dto.newPassword, 10);
        await admin.save();
        return { message: 'Mot de passe modifié avec succès' };
    }
    async getProfile(id) {
        if (!id) {
            throw new common_1.UnauthorizedException('Admin non trouvé');
        }
        const admin = await this.adminModel.findById(id).select('-password').lean();
        if (!admin) {
            throw new common_1.UnauthorizedException('Admin non trouvé');
        }
        return admin;
    }
    async updateProfile(id, body) {
        const { password, ...rest } = body;
        const update = { ...rest };
        if (password) {
            update.password = await bcrypt.hash(password, 10);
        }
        const admin = await this.adminModel
            .findByIdAndUpdate(id, update, { new: true })
            .select('-password');
        if (!admin) {
            throw new common_1.UnauthorizedException('Admin non trouvé');
        }
        return admin;
    }
    async uploadAvatar(adminId, file) {
        const admin = await this.adminModel.findById(adminId);
        if (!admin) {
            throw new common_1.UnauthorizedException('Admin non trouvé');
        }
        const uploadsDir = path.join(process.cwd(), 'uploads', 'admins');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const ext = path.extname(file.originalname) || '.jpg';
        const filename = `${(0, nanoid_1.nanoid)(12)}${ext}`;
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, file.buffer);
        const avatarUrl = `/uploads/admins/${filename}`;
        await this.adminModel.findByIdAndUpdate(adminId, { avatarUrl });
        return { avatarUrl };
    }
};
exports.AdminAuthService = AdminAuthService;
exports.AdminAuthService = AdminAuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(admin_schema_1.Admin.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService])
], AdminAuthService);
//# sourceMappingURL=admin-auth.service.js.map