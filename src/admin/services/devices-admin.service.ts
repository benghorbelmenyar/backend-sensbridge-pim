import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device } from '../schemas/device.schema';
import { FilterQueryDto } from '../dto/filter-query.dto';
import { CreateDeviceDto } from '../dto/create-device.dto';

@Injectable()
export class DevicesAdminService {
  constructor(
    @InjectModel(Device.name)
    private readonly deviceModel: Model<Device>,
  ) {}

  async findAll(query: FilterQueryDto) {
    const { search, skip, limit, sortBy, sortOrder } = query;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { deviceId: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await this.deviceModel.countDocuments(filter);
    const devices = await this.deviceModel
      .find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data: devices,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const device = await this.deviceModel.findById(id);
    if (!device) {
      throw new NotFoundException('Dispositif non trouvé');
    }
    return device;
  }

  async create(createDeviceDto: CreateDeviceDto) {
    const device = new this.deviceModel(createDeviceDto);
    return device.save();
  }

  async update(id: string, updateDto: Partial<CreateDeviceDto>) {
    const device = await this.deviceModel.findByIdAndUpdate(id, updateDto, {
      new: true,
    });
    if (!device) {
      throw new NotFoundException('Dispositif non trouvé');
    }
    return device;
  }

  async remove(id: string) {
    const result = await this.deviceModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Dispositif non trouvé');
    }
    return { message: 'Dispositif supprimé avec succès' };
  }
}

