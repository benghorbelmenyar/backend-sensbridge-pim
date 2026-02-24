import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmergencyContact } from './schemas/emergency-contact.schema';
import { CreateEmergencyContactDto } from './dtos/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from './dtos/update-emergency-contact.dto';

@Injectable()
export class EmergencyContactsService {
  constructor(
    @InjectModel(EmergencyContact.name)
    private emergencyContactModel: Model<EmergencyContact>,
  ) {}

  async findAllByUserId(userId: string): Promise<EmergencyContact[]> {
    return this.emergencyContactModel
      .find({ userId })
      .sort({ createdAt: 1 })
      .exec();
  }

  async create(
    userId: string,
    createDto: CreateEmergencyContactDto,
  ): Promise<EmergencyContact> {
    const contact = new this.emergencyContactModel({
      userId,
      name: createDto.name.trim(),
      phone: createDto.phone.trim(),
    });
    return contact.save();
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateEmergencyContactDto,
  ): Promise<EmergencyContact> {
    const contact = await this.emergencyContactModel.findById(id).exec();

    if (!contact) {
      throw new NotFoundException(`Emergency contact with ID ${id} not found`);
    }

    if (contact.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this emergency contact',
      );
    }

    if (updateDto.name !== undefined) contact.name = updateDto.name.trim();
    if (updateDto.phone !== undefined) contact.phone = updateDto.phone.trim();
    return contact.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const contact = await this.emergencyContactModel.findById(id).exec();

    if (!contact) {
      throw new NotFoundException(`Emergency contact with ID ${id} not found`);
    }

    if (contact.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this emergency contact',
      );
    }

    await this.emergencyContactModel.findByIdAndDelete(id).exec();
  }
}
