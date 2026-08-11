import { Module } from '@nestjs/common';
import { ResourcesController } from '@/modules/resources/resources.controller';
import { ResourcesService } from '@/modules/resources/resources.service';
@Module({
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}
