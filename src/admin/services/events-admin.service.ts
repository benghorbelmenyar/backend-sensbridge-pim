import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventLog } from '../schemas/event-log.schema';
import { FilterQueryDto } from '../dto/filter-query.dto';

@Injectable()
export class EventsAdminService {
  constructor(
    @InjectModel(EventLog.name)
    private readonly eventModel: Model<EventLog>,
  ) {}

  async findAll(query: FilterQueryDto) {
    const { search, skip, limit, sortBy, sortOrder } = query;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { eventType: { $regex: search, $options: 'i' } },
        { soundLabel: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await this.eventModel.countDocuments(filter);
    const events = await this.eventModel
      .find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data: events,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException('Événement non trouvé');
    }
    return event;
  }
}

