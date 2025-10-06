import { ReviewDocument, ReviewModel, ReviewSchema } from './review.model';
import { Model, Types } from 'mongoose';
import { CreateReviewDto } from './dto/create-review.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReviewService {
  constructor(@InjectModel(ReviewModel.name) private reviewModel: Model<ReviewDocument>) {}

  async create(dto: CreateReviewDto): Promise<ReviewDocument> {
    return this.reviewModel.create({
      ...dto,
      productId: new Types.ObjectId(dto.productId),
    });
  }

  async getById(id: string): Promise<ReviewDocument | null> {
    return this.reviewModel.findById(id);
  }

  async delete(reviewId: string): Promise<ReviewDocument | null> {
    return this.reviewModel.findByIdAndDelete(reviewId).exec();
  }

  async findByProductId(productId: string): Promise<ReviewDocument[]> {
    return this.reviewModel.find({ productId: new Types.ObjectId(productId) }).exec();
  }

  async deleteByProductId(productId: string): Promise<{
    acknowledged: boolean;
    deletedCount: number;
  }> {
    return this.reviewModel.deleteMany({ productId: new Types.ObjectId(productId) }).exec();
  }
}
