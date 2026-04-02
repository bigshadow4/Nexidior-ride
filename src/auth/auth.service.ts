import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'src/common/types';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    async login(body: LoginDto) {
        const { email, password } = body

        // 1. VERIFICATION DE L'UTILISATEUR
        // 1.1. Récuperer l'utilisateur unique
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        // 1.2. Vérifier si les informations de connexion sont valides
        if (!user || !user.password) {
            throw new UnauthorizedException('The email or password is invalid.');
        }

        // 1.3. Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('The password is invalid.');
        }

        // 2. GENERATION DU TOKEN
        return this.generateAuthResponse(user)
    }

    async register(body: RegisterDto) {
        const { email, password, role, name } = body

        // 1. VERIFICATION DE L'UTILISATEUR
        // 1.1. Récuperer l'utilisateur
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        // 1.2. Bloquer s'il existe
        if (user) {
            throw new ConflictException('The user already exist. Try to sign in instead.');
        }

        // 2. AJOUT L'UTILISATEUR ET TOKEN
        // 2.2. Hasher le mdp sans controle (Validation REGEX)
        const salt = await bcrypt.genSalt()
        const hash = await bcrypt.hash(password, salt);

        // 2.3 Créer l'utilisateur
        const newUser = await this.prisma.user.create({
            data: {
                email, role, name,
                password: hash
            },
        });

        // 2. GENERATION DU TOKEN
        return this.generateAuthResponse(newUser)
    }


    async logout(userId: string) {
        // Invalidation du hash en base de données
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokenHash: null },
        });
    }




    // --- HELPERS ---
    async generateAuthResponse (user: User | JwtPayload) {
        const payload = { 
            sub: user.id, 
            email: user.email, 
            role: user.role, 
        };

        const [accessToken, refreshToken] = await Promise.all([
            // Access Token (Court, ex: 15m)
            this.jwtService.signAsync(payload, { 
                secret: this.configService.get<string>('JWT_SECRET'), 
                expiresIn: '15m' 
            }),

            // Refresh Token (Long, ex: 7j)
            this.jwtService.signAsync(payload, { 
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'), 
                expiresIn: '7d' 
            }),
        ]);

        // On stocke le HASH du refresh token en BDD
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(refreshToken, salt);

        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshTokenHash: hash },
        });
        
        return { accessToken, refreshToken };
    }

    async refreshAccessToken(user: JwtPayload) {
        const payload = { 
            sub: user.id, 
            email: user.email, 
            role: user.role 
        };

        const accessToken = await this.jwtService.signAsync(payload, { 
            secret: this.configService.get<string>('JWT_SECRET'), 
            expiresIn: '15m' 
        });

        return { accessToken };
    }
}
