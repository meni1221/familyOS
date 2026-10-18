import { Controller, Post, Body, Res, Req, Get, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/index';
import { Response, Request } from 'express';
import { ValidationPipe } from '@nestjs/common';

const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * One definition for the session cookie, used when it is issued *and* when it
 * is cleared — `clearCookie` only removes a cookie whose attributes match.
 */
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
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

  @Post('logout')
  @ApiOperation({ summary: 'Logout current user' })
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
  async me(@Req() req: Request) {
    const token = req.cookies?.session;
    const user = token ? await this.authService.validateSession(token) : null;

    if (!user) {
      throw new UnauthorizedException('נדרשת התחברות');
    }

    return user;
  }
}
