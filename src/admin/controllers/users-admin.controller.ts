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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersAdminService } from '../services/users-admin.service';
import { FilterQueryDto } from '../dto/filter-query.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('Admin - Utilisateurs')
@Controller('admin/users')
@UseGuards(AdminGuard)
@ApiBearerAuth('admin-token')
export class UsersAdminController {
  constructor(private readonly usersService: UsersAdminService) {}

  @Get()
  @ApiOperation({
    summary: 'Liste des utilisateurs',
    description: 'Récupère la liste paginée avec filtres (search, profileType, limit, skip).',
  })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  findAll(@Query() query: FilterQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Statistiques utilisateurs',
    description: 'KPIs pour le Dashboard : total, actifs aujourd\'hui, par profil.',
  })
  getStats() {
    return this.usersService.getUserStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails utilisateur' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Créer utilisateur',
    description: 'Crée un utilisateur avec préférences par défaut.',
  })
  @ApiResponse({ status: 201, description: 'Utilisateur créé' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier utilisateur' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer utilisateur',
    description: 'Supprime l\'utilisateur et ses préférences associées.',
  })
  @ApiParam({ name: 'id', description: 'ID MongoDB de l\'utilisateur' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

