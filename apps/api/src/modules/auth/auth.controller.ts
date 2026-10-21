import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/index';
import { Response, Request } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { ApiSessionAuth } from '../../api-docs';
import { SESSION_COOKIE_OPTIONS, SESSION_MAX_AGE_MS } from './session-cookie';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordReset: PasswordResetService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: StatusCodes.CONFLICT,
    description: 'That email address already has an account.',
  })
  async register(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) dto: RegisterDto,
    @Res() res: Response
  ) {
    const result = await this.authService.register(dto);
    res.cookie('session', result.sessionToken, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: SESSION_MAX_AGE_MS,
    });
    res.json(result);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  // A login creates a session, not a resource: 200, not Nest's POST default.
  @HttpCode(StatusCodes.OK)
  @ApiResponse({
    status: StatusCodes.UNAUTHORIZED,
    description: 'The email or password is wrong.',
  })
  async login(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) dto: LoginDto,
    @Res() res: Response
  ) {
    const result = await this.authService.login(dto);
    res.cookie('session', result.sessionToken, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: SESSION_MAX_AGE_MS,
    });
    res.json(result);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send a password reset link' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: StatusCodes.ACCEPTED,
    description:
      'The request was accepted. The answer is the same whether or not the address has an account.',
  })
  @HttpCode(StatusCodes.ACCEPTED)
  async forgotPassword(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) dto: ForgotPasswordDto
  ) {
    await this.passwordReset.request(dto.email);
    return { success: true };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Set a new password with a reset token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: StatusCodes.BAD_REQUEST,
    description: 'The token is unknown, already used, or expired.',
  })
  @HttpCode(StatusCodes.OK)
  async resetPassword(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) dto: ResetPasswordDto
  ) {
    await this.passwordReset.reset(dto.token, dto.password);
    return { success: true };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout current user' })
  @HttpCode(StatusCodes.OK)
  async logout(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.session;
    if (token) {
      await this.authService.logout(token);
    }
    // Cleared with the very same attributes it was issued with, otherwise
    // browsers keep a cookie that no longer resolves to a session.
    res.clearCookie('session', SESSION_COOKIE_OPTIONS);
    res.json({ success: true });
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiSessionAuth()
  async me(@Req() req: Request) {
    const token = req.cookies?.session;
    const user = token ? await this.authService.validateSession(token) : null;

    if (!user) {
      throw new UnauthorizedException('נדרשת התחברות');
    }

    return user;
  }
}
