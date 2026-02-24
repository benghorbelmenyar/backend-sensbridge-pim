import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { nanoid } from 'nanoid';
import { Admin } from '../schemas/admin.schema';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { AdminRegisterDto } from '../dto/admin-register.dto';
import { AdminChangePasswordDto } from '../dto/change-password.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  async validateAdmin(email: string, password: string): Promise<Admin> {
    const admin = await this.adminModel.findOne({ email, isActive: true });
    if (!admin) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    admin.lastLogin = new Date();
    await admin.save();

    return admin;
  }

  async login(email: string, password: string) {
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

  async createAdmin(email: string, password: string, role: string = 'admin') {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new this.adminModel({
      email,
      password: hashedPassword,
      role,
    });
    return admin.save();
  }

  async register(dto: AdminRegisterDto) {
    const existing = await this.adminModel.findOne({ email: dto.email });
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé');
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

  async changePassword(id: string, dto: AdminChangePasswordDto) {
    const admin = await this.adminModel.findById(id);
    if (!admin) {
      throw new UnauthorizedException('Admin non trouvé');
    }
    const isCurrentValid = await bcrypt.compare(dto.currentPassword, admin.password);
    if (!isCurrentValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }
    admin.password = await bcrypt.hash(dto.newPassword, 10);
    await admin.save();
    return { message: 'Mot de passe modifié avec succès' };
  }

  async getProfile(id: string) {
    if (!id) {
      throw new UnauthorizedException('Admin non trouvé');
    }
    const admin = await this.adminModel.findById(id).select('-password').lean();
    if (!admin) {
      throw new UnauthorizedException('Admin non trouvé');
    }
    return admin;
  }

  async updateProfile(id: string, body: UpdateAdminDto) {
    const { password, ...rest } = body;

    const update: any = { ...rest };
    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }

    const admin = await this.adminModel
      .findByIdAndUpdate(id, update, { new: true })
      .select('-password');

    if (!admin) {
      throw new UnauthorizedException('Admin non trouvé');
    }

    return admin;
  }

  async uploadAvatar(adminId: string, file: Express.Multer.File): Promise<{ avatarUrl: string }> {
    const admin = await this.adminModel.findById(adminId);
    if (!admin) {
      throw new UnauthorizedException('Admin non trouvé');
    }
    const uploadsDir = path.join(process.cwd(), 'uploads', 'admins');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${nanoid(12)}${ext}`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, file.buffer);
    const avatarUrl = `/uploads/admins/${filename}`;
    await this.adminModel.findByIdAndUpdate(adminId, { avatarUrl });
    return { avatarUrl };
  }
}

