import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Brackets, DataSource, type EntityManager } from 'typeorm';
import { getPagination } from '@/helpers/pagination.helper';
import {
  DETAIL_RELATIONS,
  KNOWLEDGE_RELATIONS,
  METADATA_RELATIONS,
} from '@/modules/knowledge-resources/shared/config/relation.config';
import {
  RESOURCE_REGISTRY,
  isResourceName,
  type ResourceName,
} from '@/modules/knowledge-resources/shared/config/resource-registry.config';
import type { ResourceQueryDto } from '@/modules/knowledge-resources/shared/dto/resource-query.dto';
import { COLLECTION_RESOURCE_NAME } from '@/modules/knowledge-resources/collections/config/collection.config';
import { PART_OF_SPEECH_RESOURCE_NAME } from '@/modules/knowledge-resources/parts-of-speech/config/part-of-speech.config';
import { VOCABULARY_RESOURCE_NAME } from '@/modules/knowledge-resources/vocabularies/config/vocabulary.config';
import { AppLoggerService } from '@/shared-modules/logging/app-logger.service';

interface RelationDefinition {
  alias: string;
  joinTable: string;
  softDelete: boolean;
  sourceColumn: string;
  targetColumn: string;
  targetTable: string;
}

interface MetadataDefinition {
  ownerColumn: string;
  softDelete: boolean;
  table: string;
  targetColumn: string;
  targetTable: string;
}

interface KnowledgeRelationDefinition {
  sourceColumn: string;
  table: string;
  targetColumn: string;
}

/**
 * 独立知识资源模块共享的 CRUD 基础层。
 *
 * 控制器和业务入口均位于各自子模块；此服务只复用分页、逻辑删除和关系表操作。
 */
@Injectable()
export class ResourceCrudService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: AppLoggerService,
  ) {}

  async list(resourceValue: string, query: ResourceQueryDto) {
    const resource = this.resource(resourceValue);
    const config = RESOURCE_REGISTRY[resource];
    const { pageNum, pageSize, skip, take } = getPagination(
      query.pageNum,
      query.pageSize,
    );
    const builder = this.dataSource
      .createQueryBuilder()
      .select(`${config.alias}.*`)
      .from(config.table, config.alias);

    if (config.softDelete) {
      builder.where(`${config.alias}.deleted_at IS NULL`);
    } else {
      builder.where('1 = 1');
    }

    if (query.q?.trim()) {
      const q = `%${query.q.trim()}%`;

      builder.andWhere(
        new Brackets((where) =>
          config.search.forEach((field, index) => {
            const method = index === 0 ? 'where' : 'orWhere';

            where[method](`${config.alias}.${field} LIKE :q`, { q });
          }),
        ),
      );
    }

    this.applyModuleFilters(resource, builder, query);
    this.applyModuleSelects(resource, builder);

    const total = await builder.clone().select(`${config.alias}.id`).getCount();
    const orderDirection =
      'orderDirection' in config ? config.orderDirection : 'DESC';
    const data = await builder
      .orderBy(`${config.alias}.${config.order}`, orderDirection)
      .addOrderBy(`${config.alias}.id`, orderDirection)
      .skip(skip)
      .take(take)
      .getRawMany<Record<string, unknown>>();

    return { data, pagination: { pageNum, pageSize, total } };
  }

  async detail(
    resourceValue: string,
    id: number,
  ): Promise<Record<string, unknown>> {
    const resource = this.resource(resourceValue);
    const config = RESOURCE_REGISTRY[resource];
    const builder = this.dataSource
      .createQueryBuilder()
      .select(`${config.alias}.*`)
      .from(config.table, config.alias)
      .where(`${config.alias}.id = :id`, { id });

    if (config.softDelete) {
      builder.andWhere(`${config.alias}.deleted_at IS NULL`);
    }

    const item = await builder.getRawOne<Record<string, unknown>>();

    if (!item) {
      throw new NotFoundException('记录不存在');
    }

    const relations = await this.loadDetailRelations(resource, id);

    return { ...item, ...relations };
  }

  async save(
    resourceValue: string,
    body: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const resource = this.resource(resourceValue);
    const config = RESOURCE_REGISTRY[resource];
    const values = Object.fromEntries(
      config.writable
        .filter((field) => body[field] !== undefined)
        .map((field) => [field, body[field]]),
    );

    if (!Object.keys(values).length) {
      throw new BadRequestException('没有可保存字段');
    }

    const savedId = await this.dataSource.transaction(async (manager) => {
      const id = Number(body.id || 0);
      let transactionId = id;

      if (id) {
        await manager
          .createQueryBuilder()
          .update(config.table)
          .set(values)
          .where('id = :id', { id })
          .execute();
      } else {
        const result = await manager
          .createQueryBuilder()
          .insert()
          .into(config.table)
          .values(values)
          .execute();
        const raw = result.raw as { insertId?: string | number };

        transactionId = Number(result.identifiers[0]?.id || raw.insertId);
      }

      await this.syncMetadata(manager, resource, transactionId, body);

      return transactionId;
    });

    this.logger.business('Resource saved', {
      id: savedId,
      operation: body.id ? 'update' : 'create',
      resource,
    });

    return this.detail(resource, savedId);
  }

  async remove(resourceValue: string, id: number) {
    const resource = this.resource(resourceValue);
    const config = RESOURCE_REGISTRY[resource];

    if (!config.softDelete) {
      throw new BadRequestException('该资源不能删除');
    }

    await this.dataSource
      .createQueryBuilder()
      .update(config.table)
      .set({ deletedAt: () => 'CURRENT_TIMESTAMP(3)' })
      .where('id = :id', { id })
      .execute();

    this.logger.business('Resource logically deleted', { id, resource });

    return { id };
  }

  async linkRelation(
    resource: string,
    id: number,
    targetResource: string,
    targetId: number,
  ) {
    const relation = this.relationConfig(resource, targetResource);
    await Promise.all([
      this.assertResourceExists(resource, id),
      this.assertResourceExists(targetResource, targetId),
    ]);
    const sourceProperty = this.insertProperty(
      this.dataSource,
      relation.table,
      relation.sourceColumn,
    );
    const targetProperty = this.insertProperty(
      this.dataSource,
      relation.table,
      relation.targetColumn,
    );

    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(relation.table)
      .values({
        [sourceProperty]: id,
        [targetProperty]: targetId,
      })
      .orIgnore()
      .execute();

    this.logger.business('Knowledge relation linked', {
      id,
      resource,
      targetId,
      targetResource,
    });

    return { id, targetId };
  }

  async unlinkRelation(
    resource: string,
    id: number,
    targetResource: string,
    targetId: number,
  ) {
    const relation = this.relationConfig(resource, targetResource);

    await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(relation.table)
      .where(`${relation.sourceColumn} = :id`, { id })
      .andWhere(`${relation.targetColumn} = :targetId`, { targetId })
      .execute();

    this.logger.business('Knowledge relation unlinked', {
      id,
      resource,
      targetId,
      targetResource,
    });

    return { id, targetId };
  }

  async listRelations(
    resourceValue: string,
    id: number,
    targetResource: string,
  ) {
    const resource = this.resource(resourceValue);
    this.relationConfig(resource, targetResource);
    const relations = await this.loadDetailRelations(resource, id);

    return relations[targetResource] ?? [];
  }

  private resource(value: string) {
    if (!isResourceName(value)) {
      throw new BadRequestException('不支持的资源');
    }

    return value;
  }

  private applyModuleFilters(
    resource: ResourceName,
    builder: ReturnType<DataSource['createQueryBuilder']>,
    query: ResourceQueryDto,
  ) {
    if (resource === COLLECTION_RESOURCE_NAME && query.type) {
      builder.andWhere('c.type = :type', { type: query.type });
    }

    if (resource === VOCABULARY_RESOURCE_NAME && query.tagId) {
      builder.andWhere(
        'EXISTS (SELECT 1 FROM vocabulary_tags fvt WHERE fvt.vocabulary_id = v.id AND fvt.tag_id = :tagId)',
        { tagId: query.tagId },
      );
    }

    if (resource === PART_OF_SPEECH_RESOURCE_NAME) {
      builder.andWhere(
        'p.id = (SELECT MIN(p2.id) FROM parts_of_speech p2 WHERE p2.name = p.name)',
      );
    }
  }

  private applyModuleSelects(
    resource: ResourceName,
    builder: ReturnType<DataSource['createQueryBuilder']>,
  ) {
    if (resource === COLLECTION_RESOURCE_NAME) {
      builder.addSelect(
        '(SELECT COUNT(*) FROM collection_vocabularies cv WHERE cv.collection_id = c.id)',
        'member_count',
      );
      builder.addSelect(
        '(SELECT COUNT(*) FROM collection_vocabularies cv JOIN vocabularies lv ON lv.id = cv.vocabulary_id WHERE cv.collection_id = c.id AND lv.learned_at IS NOT NULL AND lv.deleted_at IS NULL)',
        'learned_count',
      );
    }

    if (resource === VOCABULARY_RESOURCE_NAME) {
      builder.addSelect(
        "(SELECT GROUP_CONCAT(p.name ORDER BY p.sort_order SEPARATOR '、') FROM vocabulary_parts_of_speech vp JOIN parts_of_speech p ON p.id=vp.part_of_speech_id WHERE vp.vocabulary_id=v.id)",
        'part_of_speech_names',
      );
      builder.addSelect(
        "(SELECT GROUP_CONCAT(t.name ORDER BY t.id SEPARATOR '、') FROM vocabulary_tags vt JOIN tags t ON t.id=vt.tag_id WHERE vt.vocabulary_id=v.id AND t.deleted_at IS NULL)",
        'tag_names',
      );
      builder.addSelect(
        "(SELECT GROUP_CONCAT(CONCAT(t.name, '|', t.color) ORDER BY t.id SEPARATOR ';;') FROM vocabulary_tags vt JOIN tags t ON t.id=vt.tag_id WHERE vt.vocabulary_id=v.id AND t.deleted_at IS NULL)",
        'tag_badges',
      );
    }

    if (resource === 'grammars') {
      builder.addSelect(
        "(SELECT GROUP_CONCAT(CONCAT(t.name, '|', t.color) ORDER BY t.id SEPARATOR ';;') FROM grammar_tags gt JOIN tags t ON t.id=gt.tag_id WHERE gt.grammar_id=g.id AND t.deleted_at IS NULL)",
        'tag_badges',
      );
    }

    if (resource === 'sentences') {
      builder.addSelect(
        "(SELECT GROUP_CONCAT(CONCAT(t.name, '|', t.color) ORDER BY t.id SEPARATOR ';;') FROM sentence_tags st JOIN tags t ON t.id=st.tag_id WHERE st.sentence_id=s.id AND t.deleted_at IS NULL)",
        'tag_badges',
      );
    }
  }

  private relationConfig(resource: string, targetResource: string) {
    const relations = KNOWLEDGE_RELATIONS as Record<
      string,
      KnowledgeRelationDefinition
    >;
    const relation = relations[`${resource}:${targetResource}`];

    if (!relation) {
      throw new BadRequestException('不支持的对象关联');
    }

    return relation;
  }

  private async loadDetailRelations(
    resource: ResourceName,
    id: number,
  ): Promise<Record<string, Record<string, unknown>[]>> {
    const relationGroups = DETAIL_RELATIONS as Record<
      string,
      Record<string, RelationDefinition>
    >;
    const group = relationGroups[resource];

    if (!group) {
      return {};
    }

    const entries: Array<[string, Record<string, unknown>[]]> =
      await Promise.all(
        Object.entries(group).map(async ([name, definition]) => [
          name,
          await this.loadRelation(definition, id),
        ]),
      );

    return Object.fromEntries(entries);
  }

  private loadRelation(
    definition: RelationDefinition,
    id: number,
  ): Promise<Record<string, unknown>[]> {
    const builder = this.dataSource
      .createQueryBuilder()
      .select(`${definition.alias}.*`)
      .from(definition.targetTable, definition.alias)
      .innerJoin(
        definition.joinTable,
        'relation',
        `relation.${definition.targetColumn}=${definition.alias}.id`,
      )
      .where(`relation.${definition.sourceColumn}=:id`, { id });

    if (definition.softDelete) {
      builder.andWhere(`${definition.alias}.deleted_at IS NULL`);
    }

    return builder.getRawMany<Record<string, unknown>>();
  }

  private async syncMetadata(
    manager: EntityManager,
    resource: ResourceName,
    id: number,
    body: Record<string, unknown>,
  ) {
    const relationGroups = METADATA_RELATIONS as Record<
      string,
      Record<string, MetadataDefinition>
    >;
    const group = relationGroups[resource];

    if (!group) {
      return;
    }

    for (const [field, definition] of Object.entries(group)) {
      const ids = body[field];

      if (Array.isArray(ids)) {
        await this.replaceRelations(manager, definition, id, ids);
      }
    }
  }

  private async replaceRelations(
    manager: EntityManager,
    definition: MetadataDefinition,
    ownerId: number,
    ids: unknown[],
  ) {
    const uniqueIds = [...new Set(ids.map(Number))];

    await this.assertMetadataTargets(manager, definition, uniqueIds);

    await manager
      .createQueryBuilder()
      .delete()
      .from(definition.table)
      .where(`${definition.ownerColumn} = :ownerId`, { ownerId })
      .execute();

    if (!uniqueIds.length) {
      return;
    }

    const ownerProperty = this.insertProperty(
      manager.connection,
      definition.table,
      definition.ownerColumn,
    );
    const targetProperty = this.insertProperty(
      manager.connection,
      definition.table,
      definition.targetColumn,
    );

    await manager
      .createQueryBuilder()
      .insert()
      .into(definition.table)
      .values(
        uniqueIds.map((id) => ({
          [ownerProperty]: ownerId,
          [targetProperty]: id,
        })),
      )
      .execute();
  }

  private async assertMetadataTargets(
    manager: EntityManager,
    definition: MetadataDefinition,
    ids: number[],
  ) {
    if (!ids.length) {
      return;
    }

    const builder = manager
      .createQueryBuilder()
      .select('COUNT(DISTINCT target.id)', 'total')
      .from(definition.targetTable, 'target')
      .where('target.id IN (:...ids)', { ids });

    if (definition.softDelete) {
      builder.andWhere('target.deleted_at IS NULL');
    }

    const result = await builder.getRawOne<{ total: string | number }>();

    if (Number(result?.total || 0) !== ids.length) {
      throw new BadRequestException('关联对象不存在或已删除');
    }
  }

  private async assertResourceExists(resourceValue: string, id: number) {
    const resource = this.resource(resourceValue);
    const config = RESOURCE_REGISTRY[resource];
    const builder = this.dataSource
      .createQueryBuilder()
      .select('1', 'present')
      .from(config.table, config.alias)
      .where(`${config.alias}.id = :id`, { id });

    if (config.softDelete) {
      builder.andWhere(`${config.alias}.deleted_at IS NULL`);
    }

    if (!(await builder.getRawOne())) {
      throw new BadRequestException('关联对象不存在或已删除');
    }
  }

  /** 已注册实体写属性名，纯关系表写数据库列名。 */
  private insertProperty(
    dataSource: DataSource,
    table: string,
    databaseColumn: string,
  ) {
    if (!dataSource.hasMetadata(table)) {
      return databaseColumn;
    }

    const column = dataSource
      .getMetadata(table)
      .columns.find((item) => item.databaseName === databaseColumn);

    return column?.propertyName || databaseColumn;
  }
}
