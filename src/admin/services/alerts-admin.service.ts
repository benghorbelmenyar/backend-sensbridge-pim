import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Alert } from '../schemas/alert.schema';
import { FilterQueryDto } from '../dto/filter-query.dto';
import { CreateAlertDto } from '../dto/create-alert.dto';

@Injectable()
export class AlertsAdminService {
  constructor(
    @InjectModel(Alert.name)
    private readonly alertModel: Model<Alert>,
  ) {}

  async findAll(query: FilterQueryDto) {
    const { search, skip, limit, sortBy, sortOrder } = query;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { message: { $regex: search, $options: 'i' } },
        { soundType: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await this.alertModel.countDocuments(filter);
    const alerts = await this.alertModel
      .find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data: alerts,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const alert = await this.alertModel.findById(id);
    if (!alert) {
      throw new NotFoundException('Alerte non trouvée');
    }
    return alert;
  }

  async create(createAlertDto: CreateAlertDto) {
    const alert = new this.alertModel(createAlertDto);
    return alert.save();
  }

  async acknowledge(id: string) {
    const alert = await this.alertModel.findByIdAndUpdate(
      id,
      { acknowledged: true, acknowledgedAt: new Date() },
      { new: true },
    );
    if (!alert) {
      throw new NotFoundException('Alerte non trouvée');
    }
    return alert;
  }

  async remove(id: string) {
    const result = await this.alertModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Alerte non trouvée');
    }
    return { message: 'Alerte supprimée avec succès' };
  }

  /** Nombre d'alertes aujourd'hui (pour badge sidebar) */
  async getCountToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.alertModel.countDocuments({ createdAt: { $gte: today } });
  }
}

