import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        private prisma: PrismaService,
        configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    // On extrait le token du cookie HttpOnly nommé 'refresh_token'
                    return req.cookies?.refresh_token;
                }
            ]),
            // 2. Ne pas échouer si le token est expiré (on laisse le Guard gérer)
            ignoreExpiration: false,
            // 3. Le secret pour valider le token
            secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
            passReqToCallback: true, // On a besoin de la requête pour récupérer le token brut
        });
    }

    async validate(req: Request, payload: any) {
        const refreshToken = req.cookies?.refresh_token;
        const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });

        if (!user || !user.refreshTokenHash) {
            throw new UnauthorizedException('Access denied.');
        }

        // On compare le token brut du cookie avec le hash en BDD
        const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);

        if (!isMatch) {
            throw new UnauthorizedException('Refresh Token is invalid.');
        }

        return { id: user.id, email: user.email, role: user.role };
    }
}