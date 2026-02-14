import { Model } from 'mongoose';
import { EmergencyContact } from './schemas/emergency-contact.schema';
import { CreateEmergencyContactDto } from './dtos/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from './dtos/update-emergency-contact.dto';
export declare class EmergencyContactsService {
    private emergencyContactModel;
    constructor(emergencyContactModel: Model<EmergencyContact>);
    findAllByUserId(userId: string): Promise<EmergencyContact[]>;
    create(userId: string, createDto: CreateEmergencyContactDto): Promise<EmergencyContact>;
    update(id: string, userId: string, updateDto: UpdateEmergencyContactDto): Promise<EmergencyContact>;
    remove(id: string, userId: string): Promise<void>;
}
