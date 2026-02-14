import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Alert } from './schemas/alert.schema';
import { CreateAlertDto } from './dtos/create-alert.dto';
import { UpdateAlertActionDto } from './dtos/update-alert-action.dto';

@Injectable()
export class AlertsService {
  constructor(
    @InjectModel(Alert.name) private alertModel: Model<Alert>,
  ) {}

  async create(userId: string, createAlertDto: CreateAlertDto): Promise<Alert> {
    const alert = new this.alertModel({
      ...createAlertDto,
      userId,
      detectedAt: createAlertDto.detectedAt || new Date(),
      actionTaken: createAlertDto.actionTaken || 'none',
    });

    return alert.save();
  }

  async findAllByUserId(
    userId: string,
    limit?: number,
    category?: string,
  ): Promise<Alert[]> {
    const query: any = { userId };

    if (category) {
      query.category = category;
    }

    const alerts = this.alertModel
      .find(query)
      .sort({ detectedAt: -1 })
      .limit(limit || 100);

    return alerts.exec();
  }

  async findOne(id: string, userId: string): Promise<Alert> {
    const alert = await this.alertModel.findById(id).exec();

    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found`);
    }

    if (alert.userId !== userId) {
      throw new ForbiddenException('You do not have access to this alert');
    }

    return alert;
  }

  async updateAction(
    id: string,
    userId: string,
    updateActionDto: UpdateAlertActionDto,
  ): Promise<Alert> {
    const alert = await this.findOne(id, userId);

    alert.actionTaken = updateActionDto.actionTaken;
    return alert.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const alert = await this.findOne(id, userId);
    await this.alertModel.findByIdAndDelete(id).exec();
  }

  async removeAllByUserId(userId: string): Promise<{ deletedCount: number }> {
    const result = await this.alertModel.deleteMany({ userId }).exec();
    return { deletedCount: result.deletedCount || 0 };
  }

  async getAlertCount(userId: string, category?: string): Promise<number> {
    const query: any = { userId };
    if (category) {
      query.category = category;
    }
    return this.alertModel.countDocuments(query).exec();
  }
}
