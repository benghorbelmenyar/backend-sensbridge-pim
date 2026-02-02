import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'; // ← AJOUTER
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService, // ← AJOUTER
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    Logger.log(`Token reçu: ${token ? 'Oui' : 'Non'}`); // ← DEBUG

    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
      
      Logger.log(`Secret utilisé: ${secret}`); // ← DEBUG
      
      // ← CORRIGER : Ajouter le secret
      const payload = this.jwtService.verify(token, { secret });
      
      Logger.log(`Payload: ${JSON.stringify(payload)}`); // ← DEBUG
      
      request.userId = payload.userId;
      return true;
    } catch (e) {
      Logger.error(`Erreur de vérification: ${e.message}`);
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}