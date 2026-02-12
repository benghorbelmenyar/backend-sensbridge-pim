import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventsAdminService } from '../services/events-admin.service';
import { FilterQueryDto } from '../dto/filter-query.dto';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('Admin - Événements')
@Controller('admin/events')
@UseGuards(AdminGuard)
@ApiBearerAuth('admin-token')
export class EventsAdminController {
  constructor(private readonly eventsService: EventsAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des événements' })
  findAll(@Query() query: FilterQueryDto) {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails événement' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }
}

