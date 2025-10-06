import { IsEnum } from 'class-validator';
import { TopLevelCategory } from '../types/TopLevelCategoryEnum';

export class FindTopPageDto {
  @IsEnum(TopLevelCategory)
  firstCategory: TopLevelCategory;
}
