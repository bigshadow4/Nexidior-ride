import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PerformanceMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', async () => {
      const duration = Date.now() - start;
      const moduleName = req.baseUrl.split('/')[1] || 'Default';
      
      // On enregistre directement en BDD pour l'interface Admin
      try {
        await this.prisma.systemLog.create({
          data: {
            module: moduleName.toUpperCase(),
            action: `${req.method} ${req.originalUrl}`,
            duration: duration,
            timestamp: new Date(),
          },
        });
      } catch (e) {
        // On évite de bloquer la réponse si le log échoue
        console.error('Error on DB Logging', e);
      }
    });

    next();
  }
}