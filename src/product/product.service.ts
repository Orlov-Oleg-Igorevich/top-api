import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProductDocument, ProductModel } from './product.model';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductDto } from './dto/find-product.dto';
import { ReviewModel } from 'src/review/review.model';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(ProductModel.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductDocument> {
    return this.productModel.create(dto);
  }

  async findById(id: string): Promise<ProductDocument | null> {
    return this.productModel.findById(id);
  }

  async deleteById(id: string): Promise<ProductDocument | null> {
    return this.productModel.findByIdAndDelete(id);
  }

  async updateProductById(
    id: string,
    dto: Partial<CreateProductDto>,
  ): Promise<ProductDocument | null> {
    return this.productModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async findByReviews(dto: FindProductDto): Promise<
    (ProductDocument & {
      review: ReviewModel[];
      reviewCount: number;
      reviewAvg: number;
    })[]
  > {
    return this.productModel
      .aggregate([
        {
          $match: {
            categories: dto.category,
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
        {
          $limit: dto.limit,
        },
        {
          $lookup: {
            from: 'reviewmodels',
            localField: '_id',
            foreignField: 'productId',
            as: 'reviews',
          },
        },
        {
          $addFields: {
            reviewCount: { $size: '$reviews' },
            reviewAvg: { $avg: '$reviews.rating' },
            reviews: {
              $function: {
                body: `function(reviews) {
                  reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                  return reviews;
                }`,
                args: ['$reviews'],
                lang: 'js',
              },
            },
          },
        },
      ])
      .exec() as Promise<
      (ProductDocument & {
        review: ReviewModel[];
        reviewCount: number;
        reviewAvg: number;
      })[]
    >;
  }
}
