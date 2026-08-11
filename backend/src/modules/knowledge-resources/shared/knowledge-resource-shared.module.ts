import { Global, Module } from '@nestjs/common';
import { ResourceCrudService } from '@/modules/knowledge-resources/shared/resource-crud.service';

/** 只向各知识资源子模块提供可复用 CRUD 基础服务。 */
@Global()
@Module({
  providers: [ResourceCrudService],
  exports: [ResourceCrudService],
})
export class KnowledgeResourceSharedModule {}
