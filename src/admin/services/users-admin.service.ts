import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserProfile } from '../schemas/user-profile.schema';
import { NotificationPreferences } from '../schemas/notification-preferences.schema';
import { FilterQueryDto } from '../dto/filter-query.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersAdminService {
  constructor(
    @InjectModel(UserProfile.name)
    private readonly userModel: Model<UserProfile>,
    @InjectModel(NotificationPreferences.name)
    private readonly prefsModel: Model<NotificationPreferences>,
  ) {}

  async findAll(query: FilterQueryDto) {
    const { search, profileType, isActive, skip, limit, sortBy, sortOrder } =
      query;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (profileType) {
      filter.profileType = profileType;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const total = await this.userModel.countDocuments(filter);
    const users = await this.userModel
      .find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data: users,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const preferences = await this.prefsModel.findOne({ userId: id });

    return {
      ...user.toObject(),
      preferences,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const existing = await this.userModel.findOne({
      email: createUserDto.email?.trim?.() || createUserDto.email,
    });
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé');
    }
    const user = new this.userModel(createUserDto);
    const savedUser = await user.save();

    const defaultPrefs = new this.prefsModel({
      userId: savedUser._id,
      channels: ['Visuel'],
      nightMode: false,
    });
    await defaultPrefs.save();

    return savedUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return user;
  }

  async remove(id: string) {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    await this.prefsModel.deleteOne({ userId: id });

    return { message: 'Utilisateur supprimé avec succès' };
  }

  async getUserStats() {
    const total = await this.userModel.countDocuments();
    const activeToday = await this.userModel.countDocuments({
      lastConnection: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const byProfile = await this.userModel.aggregate([
      { $group: { _id: '$profileType', count: { $sum: 1 } } },
    ]);

    return {
      total,
      activeToday,
      byProfile,
    };
  }
}

