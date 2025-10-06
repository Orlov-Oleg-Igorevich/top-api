import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TopLevelCategory } from '../types/TopLevelCategoryEnum';
import { Type } from 'class-transformer';

export class HhModelDto {
  @IsNumber()
  count: number;

  @IsNumber()
  juniorSalary: number;

  @IsNumber()
  middleSalary: number;

  @IsNumber()
  seniorSalary: number;
}

export class AdvantageModelDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}

export class CreateTopPageDto {
  @IsEnum(TopLevelCategory)
  firstLevelCategory: TopLevelCategory;

  @IsString()
  secondCategory: string;

  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsString()
  alias: string;

  @IsOptional()
  @Type(() => HhModelDto)
  @ValidateNested()
  hh?: HhModelDto;

  @IsArray()
  @Type(() => AdvantageModelDto)
  @ValidateNested({ each: true })
  advantages: AdvantageModelDto[];

  @IsString()
  seoText: string;

  @IsString()
  tagsTitle: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
