import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dtos/create-alert.dto';
import { UpdateAlertActionDto } from './dtos/update-alert-action.dto';
import { AuthenticationGuard } from '../guards/authentication.guard';

@ApiTags('Alerts')
@Controller('alerts')
@UseGuards(AuthenticationGuard)
@ApiBearerAuth()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new alert' })
  @ApiResponse({ status: 201, description: 'Alert created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Req() req: any, @Body() createAlertDto: CreateAlertDto) {
    const userId = req.userId;
    return this.alertsService.create(userId, createAlertDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all alerts for the authenticated user' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit number of results' })
  @ApiQuery({ name: 'category', required: false, enum: ['informative', 'danger'], description: 'Filter by category' })
  @ApiResponse({ status: 200, description: 'List of alerts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Req() req: any,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
  ) {
    const userId = req.userId;
    const limitNum = limit ? parseInt(limit.toString(), 10) : undefined;
    return this.alertsService.findAllByUserId(userId, limitNum, category);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get alert count for the authenticated user' })
  @ApiQuery({ name: 'category', required: false, enum: ['informative', 'danger'], description: 'Filter by category' })
  @ApiResponse({ status: 200, description: 'Alert count' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCount(@Req() req: any, @Query('category') category?: string) {
    const userId = req.userId;
    return this.alertsService.getAlertCount(userId, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific alert by ID' })
  @ApiResponse({ status: 200, description: 'Alert details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Alert does not belong to user' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    const userId = req.userId;
    return this.alertsService.findOne(id, userId);
  }

  @Put(':id/action')
  @ApiOperation({ summary: 'Update alert action (acknowledge, ignore, etc.)' })
  @ApiResponse({ status: 200, description: 'Alert action updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Alert does not belong to user' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  async updateAction(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateActionDto: UpdateAlertActionDto,
  ) {
    const userId = req.userId;
    return this.alertsService.updateAction(id, userId, updateActionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific alert' })
  @ApiResponse({ status: 200, description: 'Alert deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Alert does not belong to user' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  async remove(@Req() req: any, @Param('id') id: string) {
    const userId = req.userId;
    await this.alertsService.remove(id, userId);
    return { message: 'Alert deleted successfully' };
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all alerts for the authenticated user' })
  @ApiResponse({ status: 200, description: 'All alerts deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeAll(@Req() req: any) {
    const userId = req.userId;
    const result = await this.alertsService.removeAllByUserId(userId);
    return {
      message: 'All alerts deleted successfully',
      deletedCount: result.deletedCount,
    };
  }
}
