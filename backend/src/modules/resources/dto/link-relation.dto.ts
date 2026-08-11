import { IsInt, Min } from 'class-validator';

export class LinkRelationDto {
  @IsInt()
  @Min(1)
  targetId: number;
}
