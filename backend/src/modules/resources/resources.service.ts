import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Brackets, DataSource } from 'typeorm';
import { getPagination } from '@/helpers/pagination.helper';
import {
  RESOURCE_CONFIG,
  isResourceName,
  type ResourceName,
} from '@/modules/resources/config/resource.config';
import type { ResourceQueryDto } from '@/modules/resources/dto/resource-query.dto';

@Injectable()
export class ResourcesService {
  constructor(private readonly dataSource: DataSource) {}

  async list(resourceValue: string, query: ResourceQueryDto) {
    const resource = this.resource(resourceValue);
    const config = RESOURCE_CONFIG[resource];
    const { pageNum, pageSize, skip, take } = getPagination(
      query.pageNum,
      query.pageSize,
    );
    const builder = this.dataSource
      .createQueryBuilder()
      .select(`${config.alias}.*`)
      .from(config.table, config.alias);
    if (config.softDelete) builder.where(`${config.alias}.deleted_at IS NULL`);
    else builder.where('1 = 1');
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
    if (resource === 'collections' && query.type)
      builder.andWhere('c.type = :type', { type: query.type });
    if (resource === 'vocabularies' && query.tagId)
      builder.andWhere(
        'EXISTS (SELECT 1 FROM vocabulary_tags fvt WHERE fvt.vocabulary_id = v.id AND fvt.tag_id = :tagId)',
        { tagId: query.tagId },
      );
    if (resource === 'collections') {
      builder.addSelect(
        '(SELECT COUNT(*) FROM collection_vocabularies cv WHERE cv.collection_id = c.id)',
        'member_count',
      );
      builder.addSelect(
        '(SELECT COUNT(*) FROM collection_vocabularies cv JOIN vocabularies lv ON lv.id = cv.vocabulary_id WHERE cv.collection_id = c.id AND lv.learned_at IS NOT NULL AND lv.deleted_at IS NULL)',
        'learned_count',
      );
    }
    if (resource === 'vocabularies') {
      builder.addSelect(
        "(SELECT GROUP_CONCAT(p.name ORDER BY p.sort_order SEPARATOR '、') FROM vocabulary_parts_of_speech vp JOIN parts_of_speech p ON p.id=vp.part_of_speech_id WHERE vp.vocabulary_id=v.id)",
        'part_of_speech_names',
      );
      builder.addSelect(
        "(SELECT GROUP_CONCAT(t.name ORDER BY t.id SEPARATOR '、') FROM vocabulary_tags vt JOIN tags t ON t.id=vt.tag_id WHERE vt.vocabulary_id=v.id AND t.deleted_at IS NULL)",
        'tag_names',
      );
    }
    const total = await builder.clone().select(`${config.alias}.id`).getCount();
    const data = await builder
      .orderBy(`${config.alias}.${config.order}`, 'DESC')
      .addOrderBy(`${config.alias}.id`, 'DESC')
      .skip(skip)
      .take(take)
      .getRawMany<Record<string, unknown>>();
    return { data, pagination: { pageNum, pageSize, total } };
  }

  async detail(resourceValue: string, id: number) {
    const resource = this.resource(resourceValue);
    const config = RESOURCE_CONFIG[resource];
    const builder = this.dataSource
      .createQueryBuilder()
      .select(`${config.alias}.*`)
      .from(config.table, config.alias)
      .where(`${config.alias}.id = :id`, { id });
    if (config.softDelete)
      builder.andWhere(`${config.alias}.deleted_at IS NULL`);
    const item = await builder.getRawOne<Record<string, unknown>>();
    if (!item) throw new NotFoundException('记录不存在');
    if (resource === 'vocabularies')
      return { ...item, ...(await this.vocabularyRelations(id)) };
    if (resource === 'grammars')
      return { ...item, ...(await this.grammarRelations(id)) };
    if (resource === 'sentences')
      return { ...item, ...(await this.sentenceRelations(id)) };
    return item;
  }

  async save(resourceValue: string, body: Record<string, unknown>) {
    const resource = this.resource(resourceValue);
    const config = RESOURCE_CONFIG[resource];
    const values = Object.fromEntries(
      config.writable
        .filter((field) => body[field] !== undefined)
        .map((field) => [field, body[field]]),
    );
    if (!Object.keys(values).length)
      throw new BadRequestException('没有可保存字段');
    const savedId = await this.dataSource.transaction(async (manager) => {
      const id = Number(body.id || 0);
      let transactionId = id;
      if (id)
        await manager
          .createQueryBuilder()
          .update(config.table)
          .set(values)
          .where('id = :id', { id })
          .execute();
      else {
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
    return this.detail(resource, savedId);
  }

  async remove(resourceValue: string, id: number) {
    const resource = this.resource(resourceValue);
    const config = RESOURCE_CONFIG[resource];
    if (!config.softDelete) throw new BadRequestException('该资源不能删除');
    await this.dataSource
      .createQueryBuilder()
      .update(config.table)
      .set({ deleted_at: () => 'CURRENT_TIMESTAMP(3)' })
      .where('id = :id', { id })
      .execute();
    return { id };
  }

  async linkRelation(
    resource: string,
    id: number,
    targetResource: string,
    targetId: number,
  ) {
    const relation = this.relationConfig(resource, targetResource);
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(relation.table)
      .values({
        [relation.sourceColumn]: id,
        [relation.targetColumn]: targetId,
      })
      .orIgnore()
      .execute();
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
    return { id, targetId };
  }

  private resource(value: string) {
    if (!isResourceName(value)) throw new BadRequestException('不支持的资源');
    return value;
  }
  private relationConfig(resource: string, targetResource: string) {
    const relations = {
      'vocabularies:grammars': {
        table: 'vocabulary_grammars',
        sourceColumn: 'vocabulary_id',
        targetColumn: 'grammar_id',
      },
      'grammars:vocabularies': {
        table: 'vocabulary_grammars',
        sourceColumn: 'grammar_id',
        targetColumn: 'vocabulary_id',
      },
      'vocabularies:sentences': {
        table: 'vocabulary_sentences',
        sourceColumn: 'vocabulary_id',
        targetColumn: 'sentence_id',
      },
      'sentences:vocabularies': {
        table: 'vocabulary_sentences',
        sourceColumn: 'sentence_id',
        targetColumn: 'vocabulary_id',
      },
      'grammars:sentences': {
        table: 'grammar_sentences',
        sourceColumn: 'grammar_id',
        targetColumn: 'sentence_id',
      },
      'sentences:grammars': {
        table: 'grammar_sentences',
        sourceColumn: 'sentence_id',
        targetColumn: 'grammar_id',
      },
    } as const;
    const relation =
      relations[`${resource}:${targetResource}` as keyof typeof relations];
    if (!relation) throw new BadRequestException('不支持的对象关联');
    return relation;
  }
  private async replaceRelations(
    manager: import('typeorm').EntityManager,
    table: string,
    ownerColumn: string,
    ownerId: number,
    targetColumn: string,
    ids: unknown[],
  ) {
    await manager
      .createQueryBuilder()
      .delete()
      .from(table)
      .where(`${ownerColumn} = :ownerId`, { ownerId })
      .execute();
    if (ids.length)
      await manager
        .createQueryBuilder()
        .insert()
        .into(table)
        .values(
          [...new Set(ids.map(Number))].map((id) => ({
            [ownerColumn]: ownerId,
            [targetColumn]: id,
          })),
        )
        .orIgnore()
        .execute();
  }
  private async syncMetadata(
    manager: import('typeorm').EntityManager,
    resource: ResourceName,
    id: number,
    body: Record<string, unknown>,
  ) {
    if (resource === 'vocabularies' && Array.isArray(body.posIds))
      await this.replaceRelations(
        manager,
        'vocabulary_parts_of_speech',
        'vocabulary_id',
        id,
        'part_of_speech_id',
        body.posIds,
      );
    if (resource === 'vocabularies' && Array.isArray(body.collectionIds))
      await this.replaceRelations(
        manager,
        'collection_vocabularies',
        'vocabulary_id',
        id,
        'collection_id',
        body.collectionIds,
      );
    const tagConfig = {
      vocabularies: ['vocabulary_tags', 'vocabulary_id'],
      grammars: ['grammar_tags', 'grammar_id'],
      sentences: ['sentence_tags', 'sentence_id'],
    } as const;
    if (resource in tagConfig && Array.isArray(body.tagIds)) {
      const [table, column] = tagConfig[resource as keyof typeof tagConfig];
      await this.replaceRelations(
        manager,
        table,
        column,
        id,
        'tag_id',
        body.tagIds,
      );
    }
  }
  private async relation(
    table: string,
    joinTable: string,
    sourceColumn: string,
    targetColumn: string,
    id: number,
    alias: string,
    softDelete = true,
  ) {
    const builder = this.dataSource
      .createQueryBuilder()
      .select(`${alias}.*`)
      .from(table, alias)
      .innerJoin(joinTable, 'r', `r.${targetColumn}=${alias}.id`)
      .where(`r.${sourceColumn}=:id`, { id });
    if (softDelete) builder.andWhere(`${alias}.deleted_at IS NULL`);
    return builder.getRawMany();
  }
  private async vocabularyRelations(id: number) {
    const [tags, partsOfSpeech, collections, grammars, sentences] =
      await Promise.all([
        this.relation(
          'tags',
          'vocabulary_tags',
          'vocabulary_id',
          'tag_id',
          id,
          't',
        ),
        this.relation(
          'parts_of_speech',
          'vocabulary_parts_of_speech',
          'vocabulary_id',
          'part_of_speech_id',
        id,
        'p',
        false,
      ),
        this.relation(
          'collections',
          'collection_vocabularies',
          'vocabulary_id',
          'collection_id',
          id,
          'c',
        ),
        this.relation(
          'grammars',
          'vocabulary_grammars',
          'vocabulary_id',
          'grammar_id',
          id,
          'g',
        ),
        this.relation(
          'sentences',
          'vocabulary_sentences',
          'vocabulary_id',
          'sentence_id',
          id,
          's',
        ),
      ]);
    return { tags, partsOfSpeech, collections, grammars, sentences };
  }
  private async grammarRelations(id: number) {
    const [tags, sentences, vocabularies] = await Promise.all([
      this.relation('tags', 'grammar_tags', 'grammar_id', 'tag_id', id, 't'),
      this.relation(
        'sentences',
        'grammar_sentences',
        'grammar_id',
        'sentence_id',
        id,
        's',
      ),
      this.relation(
        'vocabularies',
        'vocabulary_grammars',
        'grammar_id',
        'vocabulary_id',
        id,
        'v',
      ),
    ]);
    return { tags, sentences, vocabularies };
  }
  private async sentenceRelations(id: number) {
    const [tags, grammars, vocabularies] = await Promise.all([
      this.relation('tags', 'sentence_tags', 'sentence_id', 'tag_id', id, 't'),
      this.relation(
        'grammars',
        'grammar_sentences',
        'sentence_id',
        'grammar_id',
        id,
        'g',
      ),
      this.relation(
        'vocabularies',
        'vocabulary_sentences',
        'sentence_id',
        'vocabulary_id',
        id,
        'v',
      ),
    ]);
    return { tags, grammars, vocabularies };
  }
}
