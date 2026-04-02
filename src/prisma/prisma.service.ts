// src/prisma/prisma.service.ts

import { OnApplicationShutdown, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnApplicationShutdown {  
  async onModuleInit() {
    // Connexion à la DB au démarrage de l'application
    await this.$connect();
  }

  // Fonction optionnelle pour déconnexion propre (utile pour les tests ou si besoin)
  async onApplicationShutdown() {
    await this.$disconnect();
  }
}