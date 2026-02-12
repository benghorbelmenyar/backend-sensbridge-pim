import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AlertsAdminService } from '../services/alerts-admin.service';
import { FilterQueryDto } from '../dto/filter-query.dto';
import { CreateAlertDto } from '../dto/create-alert.dto';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('Admin - Alertes')
@Controller('admin/alerts')
@UseGuards(AdminGuard)
@ApiBearerAuth('admin-token')
export class AlertsAdminController {
  constructor(private readonly alertsService: AlertsAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des alertes' })
  findAll(@Query() query: FilterQueryDto) {
    return this.alertsService.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Nombre d\'alertes aujourd\'hui (badge)' })
  async getCount() {
    const count = await this.alertsService.getCountToday();
    return { count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails alerte' })
  findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer alerte' })
  create(@Body() createAlertDto: CreateAlertDto) {
    return this.alertsService.create(createAlertDto);
  }

  @Post(':id/acknowledge')
  @ApiOperation({ summary: 'Acquitter alerte' })
  acknowledge(@Param('id') id: string) {
    return this.alertsService.acknowledge(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer alerte' })
  remove(@Param('id') id: string) {
    return this.alertsService.remove(id);
  }
}

