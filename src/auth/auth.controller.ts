import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import type { RequestWithUser } from 'src/common/types';
import { JwtRefreshGuard } from 'src/common/guards/jwt-refresh.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) {}

    @ApiOperation({ summary: 'Sign in' })
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() body: LoginDto,
        @Res({ passthrough: true }) response: Response
    ) {
        const { accessToken, refreshToken } = await this.authService.login(body);

        // On cache le refresh token dans le cookie
        response.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Uniquement en HTTPS (en prod)
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        });

        return { 
            success: true,
            accessToken 
        };
    }


    @ApiOperation({ summary: 'Sign up' })
    @Post('register')
    @HttpCode(HttpStatus.OK)
    async register(
        @Body() body: RegisterDto,
        @Res({ passthrough: true }) response: Response
    ) {
        const { accessToken, refreshToken } = await this.authService.register(body);

        // On cache le refresh token dans le cookie
        response.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Uniquement en HTTPS (en prod)
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        });

        return { 
            success: true,
            accessToken 
        };
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Ask for a new refresh token' })
    @UseGuards(JwtRefreshGuard)
    @Post('refresh')
    async refresh(
        @Req() req: RequestWithUser, 
        @Res({ passthrough: true }) res: Response
    ) {
        // Si on arrive ici, le Refresh Token a été validé et comparé au hash BDD
        const { accessToken, refreshToken } = await this.authService.generateAuthResponse(req.user);
        
        // On met à jour le cookie avec le nouveau Refresh Token
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { 
            success: true,
            accessToken 
        };
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Sign out' })
    @UseGuards(JwtGuard) // Protection par Access Token standard
    @Post('logout')
    async logout(
        @Req() req: RequestWithUser,
        @Res({ passthrough: true }) response: Response
    ) {
        await this.authService.logout(req.user.id);
        
        // Nettoyage du cookie HttpOnly
        response.clearCookie('refresh_token');

        return { success: true };
    }
}
