import { Model } from 'mongoose';
import { Alert } from './schemas/alert.schema';
import { CreateAlertDto } from './dtos/create-alert.dto';
import { UpdateAlertActionDto } from './dtos/update-alert-action.dto';
export declare class AlertsService {
    private alertModel;
    constructor(alertModel: Model<Alert>);
    create(userId: string, createAlertDto: CreateAlertDto): Promise<Alert>;
    findAllByUserId(userId: string, limit?: number, category?: string): Promise<Alert[]>;
    findOne(id: string, userId: string): Promise<Alert>;
    updateAction(id: string, userId: string, updateActionDto: UpdateAlertActionDto): Promise<Alert>;
    remove(id: string, userId: string): Promise<void>;
    removeAllByUserId(userId: string): Promise<{
        deletedCount: number;
    }>;
    getAlertCount(userId: string, category?: string): Promise<number>;
}
