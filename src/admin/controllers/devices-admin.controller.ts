import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DevicesAdminService } from '../services/devices-admin.service';
import { FilterQueryDto } from '../dto/filter-query.dto';
import { CreateDeviceDto } from '../dto/create-device.dto';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('Admin - Dispositifs')
@Controller('admin/devices')
@UseGuards(AdminGuard)
@ApiBearerAuth('admin-token')
export class DevicesAdminController {
  constructor(private readonly devicesService: DevicesAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des dispositifs' })
  findAll(@Query() query: FilterQueryDto) {
    return this.devicesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails dispositif' })
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer dispositif' })
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier dispositif' })
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateDeviceDto>) {
    return this.devicesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer dispositif' })
  remove(@Param('id') id: string) {
    return this.devicesService.remove(id);
  }
}

