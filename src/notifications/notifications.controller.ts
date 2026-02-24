import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { RegisterTokenDto } from './dtos/register-token.dto';
import {
  SendNotificationDto,
  SendBatchNotificationDto,
  SubscribeTopicDto,
  NotificationEnabledDto,
} from './dtos/send-notification.dto';
import { AuthenticationGuard } from '../guards/authentication.guard';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('register-token')
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register or update FCM token' })
  @ApiResponse({ status: 200, description: 'Token registered' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async registerToken(@Body() dto: RegisterTokenDto, @Req() req: any) {
    return this.notificationsService.registerToken(req.userId, dto.token);
  }

  @Post('test')
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a test notification to the current user (for testing FCM)' })
  @ApiResponse({ status: 200, description: 'Test notification sent or error details' })
  async sendTest(@Req() req: any) {
    return this.notificationsService.sendToUser(
      req.userId,
      'test',
      'SenseBridge Test',
      'If you see this, Firebase notifications are working!',
      { type: 'test', action: 'none' },
    );
  }

  @Delete('token')
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove FCM token (e.g. on logout)' })
  @ApiResponse({ status: 200, description: 'Token removed' })
  async removeToken(@Req() req: any) {
    return this.notificationsService.removeToken(req.userId);
  }

  @Get('history')
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notification history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated history' })
  async getHistory(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page ?? '1', 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? '20', 10) || 20));
    return this.notificationsService.getHistory(req.userId, pageNum, limitNum);
  }

  @Patch(':id/read')
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.markAsRead(req.userId, id);
  }

  @Post('subscribe-topic')
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe to a notification topic' })
  @ApiResponse({ status: 200, description: 'Subscribed' })
  async subscribeTopic(@Body() dto: SubscribeTopicDto, @Req() req: any) {
    return this.notificationsService.subscribeToTopic(req.userId, dto.topic);
  }

  @Post('unsubscribe-topic')
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unsubscribe from a topic' })
  async unsubscribeTopic(@Body() dto: SubscribeTopicDto, @Req() req: any) {
    return this.notificationsService.unsubscribeFromTopic(req.userId, dto.topic);
  }

  @Patch('settings/enabled')
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable or disable FCM notifications' })
  async setEnabled(@Body() body: NotificationEnabledDto, @Req() req: any) {
    return this.notificationsService.setNotificationEnabled(
      req.userId,
      body.enabled ?? true,
    );
  }

  @Post('send')
  @ApiOperation({ summary: 'Send notification to a user (admin)' })
  @ApiResponse({ status: 200, description: 'Sent' })
  async send(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendToUser(
      dto.userId,
      dto.type,
      dto.title,
      dto.body,
      dto.data,
      dto.imageUrl,
    );
  }

  @Post('send-batch')
  @ApiOperation({ summary: 'Send notification to multiple users (admin)' })
  @ApiResponse({ status: 200, description: 'Batch result' })
  async sendBatch(@Body() dto: SendBatchNotificationDto) {
    return this.notificationsService.sendBatch(
      dto.userIds,
      dto.type,
      dto.title,
      dto.body,
      dto.data,
      dto.imageUrl,
    );
  }
}
