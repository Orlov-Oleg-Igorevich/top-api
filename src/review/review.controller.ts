import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewService } from './review.service';
import { REVIEW_NOT_FOUND } from './review.constans';
import { ReviewDocument } from './review.model';
import { JwtAuthGuard } from '../../src/auth/guards/jwt.guard';
import { UserEmail } from '../../src/decorators/user-email.decorator';
import { IdValidationPipes } from '../../src/pipes/id-validation.pipes';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() dto: CreateReviewDto): Promise<ReviewDocument> {
    return this.reviewService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async get(@Param('id', IdValidationPipes) id: string): Promise<ReviewDocument> {
    const review = await this.reviewService.getById(id);
    if (!review) {
      throw new NotFoundException(REVIEW_NOT_FOUND);
    }
    return review;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', IdValidationPipes) id: string): Promise<ReviewDocument> {
    const res = await this.reviewService.delete(id);
    if (!res) throw new NotFoundException(REVIEW_NOT_FOUND);
    return res;
  }

  @UseGuards(JwtAuthGuard)
  @Get('byProduct/:productId')
  async getByProduct(
    @Param('productId', IdValidationPipes) productId: string,
    @UserEmail() userEmail: string,
  ): Promise<ReviewDocument[]> {
    return this.reviewService.findByProductId(productId);
  }
}
