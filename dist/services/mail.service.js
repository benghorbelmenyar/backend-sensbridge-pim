"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let MailService = class MailService {
    configService;
    transporter;
    etherealTransporter = null;
    constructor(configService) {
        this.configService = configService;
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('MAIL_HOST') || 'localhost',
            port: Number(this.configService.get('MAIL_PORT')) || 587,
            secure: false,
            auth: {
                user: this.configService.get('MAIL_USER'),
                pass: this.configService.get('MAIL_PASSWORD'),
            },
        });
    }
    isMailConfigured() {
        const host = this.configService.get('MAIL_HOST');
        const user = this.configService.get('MAIL_USER');
        return !!(host && user);
    }
    async getEtherealTransporter() {
        if (this.etherealTransporter)
            return this.etherealTransporter;
        const testAccount = await nodemailer.createTestAccount();
        this.etherealTransporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
        console.log('📧 Mode dev : emails envoyés via Ethereal (compte de test). Lien de prévisualisation affiché dans les logs.');
        return this.etherealTransporter;
    }
    async sendPasswordResetEmail(email, otp) {
        const mailOptions = {
            from: this.configService.get('MAIL_FROM'),
            to: email,
            subject: 'Réinitialisation de votre mot de passe - SenseBridge',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 8px 24px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #4CAF50 0%, #45A048 100%);
              padding: 40px 30px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .content {
              padding: 40px 30px;
            }
            .content p {
              margin: 0 0 20px;
              font-size: 16px;
              line-height: 1.8;
            }
            .otp-container {
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              border: 3px solid #4CAF50;
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-label {
              font-size: 14px;
              color: #6c757d;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 15px;
            }
            .otp-code {
              font-size: 48px;
              font-weight: bold;
              color: #4CAF50;
              letter-spacing: 12px;
              margin: 20px 0;
              font-family: 'Courier New', monospace;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            }
            .otp-validity {
              font-size: 13px;
              color: #6c757d;
              margin-top: 15px;
            }
            .warning-box {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 20px;
              margin: 25px 0;
              border-radius: 4px;
            }
            .warning-box p {
              margin: 0;
              font-size: 14px;
              color: #856404;
            }
            .warning-box strong {
              display: block;
              margin-bottom: 8px;
              font-size: 15px;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 30px;
              text-align: center;
              font-size: 14px;
              color: #6c757d;
              border-top: 1px solid #e9ecef;
            }
            .footer-logo {
              font-size: 18px;
              font-weight: bold;
              color: #4CAF50;
              margin-bottom: 10px;
            }
            .divider {
              height: 2px;
              background: linear-gradient(90deg, transparent, #4CAF50, transparent);
              margin: 30px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 SenseBridge</h1>
              <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.95;">
                Réinitialisation de mot de passe
              </p>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; font-weight: 600; color: #2d3748;">
                Bonjour,
              </p>
              
              <p>
                Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte <strong>SenseBridge</strong>.
              </p>
              
              <div class="otp-container">
                <div class="otp-label">Votre code de vérification</div>
                <div class="otp-code">${otp}</div>
                <div class="otp-validity">
                  ⏱️ Valide pendant <strong>1 heure</strong>
                </div>
              </div>
              
              <p>
                Entrez ce code dans l'application pour continuer la réinitialisation de votre mot de passe.
              </p>
              
              <div class="divider"></div>
              
              <div class="warning-box">
                <strong>⚠️ Attention - Sécurité</strong>
                <p>
                  Si vous n'avez pas demandé cette réinitialisation, veuillez <strong>ignorer cet email</strong>. 
                  Votre mot de passe restera inchangé et votre compte reste sécurisé.
                </p>
              </div>
              
              <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
                Pour votre sécurité, ne partagez jamais ce code avec qui que ce soit.
              </p>
              
              <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
                Cordialement,<br>
                <strong style="color: #4CAF50;">L'équipe SenseBridge</strong>
              </p>
            </div>
            
            <div class="footer">
              <div class="footer-logo">SenseBridge</div>
              <p style="margin: 10px 0; font-size: 13px;">
                AI-powered communication for everyone
              </p>
              <p style="margin: 10px 0 0; font-size: 12px; color: #adb5bd;">
                Cet email a été envoyé à <strong>${email}</strong>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
        };
        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email envoyé:', info.messageId);
            return { success: true, messageId: info.messageId };
        }
        catch (error) {
            console.error('❌ Erreur envoi email:', error);
            throw error;
        }
    }
    async sendPasswordResetConfirmation(email, userName) {
        const mailOptions = {
            from: this.configService.get('MAIL_FROM'),
            to: email,
            subject: '✅ Mot de passe réinitialisé avec succès - SenseBridge',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 8px 24px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #4CAF50 0%, #45A048 100%);
              padding: 40px 30px;
              text-align: center;
              color: white;
            }
            .content {
              padding: 40px 30px;
            }
            .success-icon {
              text-align: center;
              font-size: 80px;
              margin: 20px 0;
            }
            .success-title {
              text-align: center;
              color: #4CAF50;
              font-size: 28px;
              font-weight: bold;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 SenseBridge</h1>
            </div>
            
            <div class="content">
              <div class="success-icon">✅</div>
              
              <h2 class="success-title">Mot de passe réinitialisé !</h2>
              
              <p>Bonjour <strong>${userName}</strong>,</p>
              
              <p>Votre mot de passe a été réinitialisé avec succès.</p>
              
              <p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                  <strong>⚠️ Vous n'êtes pas à l'origine de cette action ?</strong><br>
                  Veuillez contacter immédiatement notre support pour sécuriser votre compte.
                </p>
              </div>
              
              <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
                Cordialement,<br>
                <strong style="color: #4CAF50;">L'équipe SenseBridge</strong>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
            console.log('✅ Email de confirmation envoyé');
        }
        catch (error) {
            console.error('❌ Erreur envoi email confirmation:', error);
        }
    }
    async sendApprovalAcceptanceEmail(to, userName) {
        if (!to || !to.trim()) {
            console.warn('⚠️ Email d\'acceptation non envoyé : adresse email destinataire manquante.');
            return;
        }
        const displayName = (userName && String(userName).trim()) || 'Utilisateur';
        const from = this.isMailConfigured()
            ? (this.configService.get('MAIL_FROM') || this.configService.get('MAIL_USER') || 'noreply@sensebridge.com')
            : 'SenseBridge <noreply@ethereal.email>';
        const mailOptions = {
            from,
            to: to.trim(),
            subject: 'Votre compte SenseBridge a été accepté',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #4CAF50 0%, #45A048 100%); padding: 40px 30px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .content { padding: 40px 30px; }
            .content p { margin: 0 0 20px; font-size: 16px; line-height: 1.8; }
            .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 25px 0; border-radius: 4px; }
            .footer { background-color: #f8f9fa; padding: 30px; text-align: center; font-size: 14px; color: #6c757d; border-top: 1px solid #e9ecef; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SenseBridge</h1>
              <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.95;">Demande d'inscription acceptée</p>
            </div>
            <div class="content">
              <p style="font-size: 18px; font-weight: 600;">Bonjour <strong>${displayName}</strong>,</p>
              <p>Votre demande d'inscription sur l'application SenseBridge a été <strong>acceptée</strong> par notre équipe.</p>
              <div class="success-box">
                <p style="margin: 0; color: #155724;"><strong>Vous pouvez maintenant vous connecter</strong> à l'application avec votre email et votre mot de passe.</p>
              </div>
              <p>Bienvenue dans la communauté SenseBridge.</p>
              <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">Cordialement,<br><strong style="color: #4CAF50;">L'équipe SenseBridge</strong></p>
            </div>
            <div class="footer">
              <p style="margin: 0; font-size: 13px;">Cet email a été envoyé à ${to}</p>
            </div>
          </div>
        </body>
        </html>
      `,
        };
        try {
            const transport = this.isMailConfigured()
                ? this.transporter
                : await this.getEtherealTransporter();
            const info = await transport.sendMail(mailOptions);
            if (this.isMailConfigured()) {
                console.log('✅ Email d\'acceptation envoyé à', to);
            }
            else {
                const previewUrl = nodemailer.getTestMessageUrl(info);
                console.log('✅ Email d\'acceptation (mode dev Ethereal) envoyé à', to);
                if (previewUrl) {
                    console.log('   📬 Prévisualiser l\'email :', previewUrl);
                }
            }
        }
        catch (error) {
            console.error('❌ Erreur envoi email acceptation:', error);
            throw error;
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map