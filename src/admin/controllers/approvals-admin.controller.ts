import { Body, Controller, Delete, Get, Put, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { AuthService } from '../../auth/auth.service';
import { RejectUserDto } from '../dto/reject-user.dto';
import { UpdateProfileDto } from '../../auth/dtos/update-profile.dto';

@ApiTags('Admin - Approbations (app mobile)')
@Controller('admin/approvals')
@UseGuards(AdminGuard)
@ApiBearerAuth('admin-token')
export class ApprovalsAdminController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @ApiOperation({
    summary: 'Liste des utilisateurs en attente',
    description: 'Utilisateurs inscrits depuis l\'app mobile en attente d\'acceptation ou de refus.',
  })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs en attente' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  getPending() {
    return this.authService.getPendingUsers();
  }

  @Get('count')
  @ApiOperation({ summary: 'Nombre d\'utilisateurs en attente (badge)' })
  @ApiResponse({ status: 200, description: '{ count: number }' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getPendingCount() {
    const count = await this.authService.getPendingCount();
    return { count };
  }

  @Get('users/stats')
  @ApiOperation({ summary: 'Stats inscrits app par type (Normal Person, Deaf Person, Organization)' })
  @ApiResponse({ status: 200, description: '{ total, byUserType }' })
  getAppUsersStats() {
    return this.authService.getAppUsersStatsByType();
  }

  @Get('users')
  @ApiOperation({
    summary: 'Liste des utilisateurs app mobile (actifs/inactifs, blocage)',
    description: 'Liste paginée avec search. Permet de bloquer/débloquer les utilisateurs.',
  })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Liste paginée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  getAppUsers(
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.authService.getAppUsers({
      skip: skip != null ? parseInt(skip, 10) : undefined,
      limit: limit != null ? parseInt(limit, 10) : undefined,
      search,
    });
  }

  @Put(':id/accept')
  @ApiOperation({ summary: 'Accepter un utilisateur' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur (auth User)' })
  @ApiResponse({ status: 200, description: 'Utilisateur accepté' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  accept(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user?.sub?.toString?.();
    return this.authService.approveUser(id, adminId);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Refuser un utilisateur (optionnel: raison du refus)' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur (auth User)' })
  @ApiBody({ type: RejectUserDto, required: false })
  @ApiResponse({ status: 200, description: 'Utilisateur refusé' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  reject(@Param('id') id: string, @Req() req: any, @Body() body?: RejectUserDto) {
    const adminId = req.user?.sub?.toString?.();
    return this.authService.rejectUser(id, adminId, body?.reason);
  }

  @Put(':id/block')
  @ApiOperation({ summary: 'Bloquer un utilisateur (statut inactif)' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur (auth User)' })
  @ApiResponse({ status: 200, description: 'Utilisateur bloqué' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  block(@Param('id') id: string) {
    return this.authService.blockUser(id);
  }

  @Put(':id/unblock')
  @ApiOperation({ summary: 'Débloquer un utilisateur (statut actif)' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur (auth User)' })
  @ApiResponse({ status: 200, description: 'Utilisateur débloqué' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  unblock(@Param('id') id: string) {
    return this.authService.unblockUser(id);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Détail d\'un utilisateur inscrit (app mobile)' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  getOneAppUser(@Param('id') id: string) {
    return this.authService.getOneAppUser(id);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Modifier un utilisateur inscrit (nom, email, téléphone, etc.)' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  @ApiBody({ type: UpdateProfileDto, required: false })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  updateAppUser(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.authService.updateAppUser(id, dto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Supprimer un utilisateur inscrit (même base que l\'app)' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  deleteAppUser(@Param('id') id: string) {
    return this.authService.deleteAppUser(id);
  }
}
