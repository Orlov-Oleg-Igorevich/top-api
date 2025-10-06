import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @IsString()
  name: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber({}, { message: 'Рейтинг должен быть числом' })
  @Min(1, { message: 'Значение рейтинга не может быть меньше 1' })
  @Max(5, { message: 'Значение рейтинга не может быть больше 5' })
  rating: number;

  @IsString()
  productId: string;
}
