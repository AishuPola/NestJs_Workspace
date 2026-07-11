// apps/api/src/app/auth/auth.controller.ts

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import {
  AuthService,
  RegisterDto,
  LoginDto,
  SafeUser,
} from '@my-nest-workspace/iop-common-utilities';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Request() req, // ← NEW
  ): Promise<SafeUser> {
    return this.authService.register(
      dto.username,
      dto.email,
      dto.password,
      dto.role,
      req.traceId, // ← pass traceId down
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Request() req, // ← NEW
  ): Promise<{ access_token: string; user: SafeUser }> {
    return this.authService.login(
      dto.email,
      dto.password,
      req.traceId, // ← pass traceId down
    );
  }
}
