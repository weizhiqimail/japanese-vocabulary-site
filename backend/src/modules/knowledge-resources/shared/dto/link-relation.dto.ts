import { IsIn, IsInt, Min } from 'class-validator';

/** 新增知识对象关系时只接受数据库 ID。 */
export class LinkRelationDto {
  @IsIn(['vocabularies', 'grammars', 'sentences'])
  targetResource: string;

  @IsInt()
  @Min(1)
  targetId: number;
}
