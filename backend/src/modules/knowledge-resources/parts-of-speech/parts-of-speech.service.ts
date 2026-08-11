import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PART_OF_SPEECH_RESOURCE_NAME } from '@/modules/knowledge-resources/parts-of-speech/config/part-of-speech.config';
import type { SavePartOfSpeechDto } from '@/modules/knowledge-resources/parts-of-speech/dto/save-part-of-speech.dto';
import { ResourceCrudService } from '@/modules/knowledge-resources/shared/resource-crud.service';
import type { ResourceQueryDto } from '@/modules/knowledge-resources/shared/dto/resource-query.dto';

/** 词性模块业务入口。 */
@Injectable()
export class PartsOfSpeechService {
  constructor(
    private readonly resources: ResourceCrudService,
    private readonly dataSource: DataSource,
  ) {}

  list(query: ResourceQueryDto) {
    return this.resources.list(PART_OF_SPEECH_RESOURCE_NAME, query);
  }

  detail(id: number) {
    return this.resources.detail(PART_OF_SPEECH_RESOURCE_NAME, id);
  }

  async save(dto: SavePartOfSpeechDto) {
    if (!dto.partOfSpeechId && !dto.code?.trim()) {
      throw new BadRequestException('新增词性必须填写代码');
    }

    const maximum = dto.partOfSpeechId
      ? undefined
      : await this.dataSource
          .createQueryBuilder()
          .select('COALESCE(MAX(p.sort_order), 0)', 'maximum')
          .from('parts_of_speech', 'p')
          .getRawOne<{ maximum: string | number }>();

    return this.resources.save(PART_OF_SPEECH_RESOURCE_NAME, {
      ...dto,
      id: dto.partOfSpeechId,
      sort_order: maximum ? Number(maximum.maximum) + 10 : undefined,
    });
  }
}
