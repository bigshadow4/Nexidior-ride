import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(configService: ConfigService) {
        super({
            // 1. La fonction qui extrait le token du header
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    const authHeader = req.headers.authorization?.split(' ')
                    return authHeader?.[1] ?? null
                }
            ]),
            // 2. Ne pas échouer si le token est expiré (on laisse le Guard gérer)
            ignoreExpiration: false,
            // 3. Le secret pour valider le token
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
        });
    }

    async validate(payload: any) {
        return { 
            id: payload.sub, 
            email: payload.email, 
            role: payload.role, 
        };
    }
}