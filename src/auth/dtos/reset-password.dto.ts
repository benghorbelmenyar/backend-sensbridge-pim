import { IsString, Matches, MinLength } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


export class ResetPasswordDto {
  @IsString()
  resetToken: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])/, { message: 'Password must contain at least one number' })
  newPassword: string;
 
}
