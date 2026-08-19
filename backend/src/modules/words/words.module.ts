import { Module } from '@nestjs/common';
import { DashboardModule } from '@/modules/dashboard/dashboard.module';
import { ImportsModule } from '@/modules/imports/imports.module';
import { KnowledgeResourcesModule } from '@/modules/knowledge-resources/knowledge-resources.module';
import { SettingsModule } from '@/modules/settings/settings.module';
import { StudyModule } from '@/modules/study/study.module';

/** 原有日语知识、集合、学习、复习和维护业务域。 */
@Module({
  imports: [
    DashboardModule,
    KnowledgeResourcesModule,
    StudyModule,
    SettingsModule,
    ImportsModule,
  ],
})
export class WordsModule {}
