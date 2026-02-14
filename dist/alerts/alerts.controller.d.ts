import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dtos/create-alert.dto';
import { UpdateAlertActionDto } from './dtos/update-alert-action.dto';
export declare class AlertsController {
    private readonly alertsService;
    constructor(alertsService: AlertsService);
    create(req: any, createAlertDto: CreateAlertDto): Promise<import("./schemas/alert.schema").Alert>;
    findAll(req: any, limit?: number, category?: string): Promise<import("./schemas/alert.schema").Alert[]>;
    getCount(req: any, category?: string): Promise<number>;
    findOne(req: any, id: string): Promise<import("./schemas/alert.schema").Alert>;
    updateAction(req: any, id: string, updateActionDto: UpdateAlertActionDto): Promise<import("./schemas/alert.schema").Alert>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
    removeAll(req: any): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
