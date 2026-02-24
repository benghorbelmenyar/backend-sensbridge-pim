import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /** Redirection vers l’interface admin : évite le 404 quand on ouvre /login sur le backend. */
  @Get('login')
  loginPage(@Res() res: Response) {
    const adminUrl = this.configService.get<string>('FRONT_ADMIN_URL') || 'http://localhost:3001';
    res.redirect(302, `${adminUrl}/login`);
  }
}
