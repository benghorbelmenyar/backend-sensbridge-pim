import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EmergencyContactsService } from './emergency-contacts.service';
import { CreateEmergencyContactDto } from './dtos/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from './dtos/update-emergency-contact.dto';
import { AuthenticationGuard } from '../guards/authentication.guard';

@ApiTags('Emergency Contacts')
@Controller('emergency-contacts')
@UseGuards(AuthenticationGuard)
@ApiBearerAuth()
export class EmergencyContactsController {
  constructor(
    private readonly emergencyContactsService: EmergencyContactsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all emergency contacts for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of emergency contacts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Req() req: any) {
    const userId = req.userId;
    return this.emergencyContactsService.findAllByUserId(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add an emergency contact' })
  @ApiResponse({ status: 201, description: 'Emergency contact created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Req() req: any,
    @Body() createDto: CreateEmergencyContactDto,
  ) {
    const userId = req.userId;
    return this.emergencyContactsService.create(userId, createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an emergency contact' })
  @ApiResponse({ status: 200, description: 'Emergency contact updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Contact does not belong to user' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateEmergencyContactDto,
  ) {
    const userId = req.userId;
    return this.emergencyContactsService.update(id, userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an emergency contact' })
  @ApiResponse({ status: 200, description: 'Emergency contact deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Contact does not belong to user' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async remove(@Req() req: any, @Param('id') id: string) {
    const userId = req.userId;
    await this.emergencyContactsService.remove(id, userId);
    return { message: 'Emergency contact deleted successfully' };
  }
}
