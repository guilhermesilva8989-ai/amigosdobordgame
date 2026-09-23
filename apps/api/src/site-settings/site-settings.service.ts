import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { SaveSiteSettingsDto } from './dto/save-site-settings.dto.js';

const SETTINGS_ID = 'main';

const DEFAULT_SETTINGS = {
  id: SETTINGS_ID,
  heroTitle: 'Diversão organizada, contas transparentes.',
  heroDescription:
    'Acompanhe as contribuições, despesas e o saldo do grupo de forma simples e segura.',
  bannerUrl: '/banner.jpeg',
  showGoal: true,
  nameDisplayMode: 'FANTASY' as const,
};

@Injectable()
export class SiteSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async find() {
    const settings = await this.prisma.siteSettings.findUnique({
      where: { id: SETTINGS_ID },
    });

    return settings ?? DEFAULT_SETTINGS;
  }

  async save(dto: SaveSiteSettingsDto, adminId: string) {
    const settingsOperation = this.prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      create: {
        id: SETTINGS_ID,
        ...dto,
      },
      update: dto,
    });

    const [settings] = await this.prisma.$transaction([
      settingsOperation,
      this.prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          entity: 'SiteSettings',
          entityId: SETTINGS_ID,
          createdById: adminId,
          details: {
            heroTitle: dto.heroTitle,
            bannerUrl: dto.bannerUrl,
            showGoal: dto.showGoal,
            nameDisplayMode: dto.nameDisplayMode,
          },
        },
      }),
    ]);

    return settings;
  }
}