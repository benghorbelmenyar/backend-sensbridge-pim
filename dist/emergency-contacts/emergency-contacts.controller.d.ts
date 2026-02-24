import { EmergencyContactsService } from './emergency-contacts.service';
import { CreateEmergencyContactDto } from './dtos/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from './dtos/update-emergency-contact.dto';
export declare class EmergencyContactsController {
    private readonly emergencyContactsService;
    constructor(emergencyContactsService: EmergencyContactsService);
    findAll(req: any): Promise<import("./schemas/emergency-contact.schema").EmergencyContact[]>;
    create(req: any, createDto: CreateEmergencyContactDto): Promise<import("./schemas/emergency-contact.schema").EmergencyContact>;
    update(req: any, id: string, updateDto: UpdateEmergencyContactDto): Promise<import("./schemas/emergency-contact.schema").EmergencyContact>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
}
