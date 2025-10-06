import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TopPageDocument, TopPageModel } from './top-page.model';
import { Model } from 'mongoose';
import { CreateTopPageDto } from './dto/create-top-page.dto';
import { FindTopPageDto } from './dto/find-top-page.dto';
import { ProductDocument } from 'src/product/product.model';

@Injectable()
export class TopPageService {
  constructor(
    @InjectModel(TopPageModel.name) private readonly topPageModel: Model<TopPageDocument>,
  ) {}

  async create(dto: CreateTopPageDto): Promise<TopPageDocument> {
    return this.topPageModel.create(dto);
  }

  async findById(id: string): Promise<TopPageDocument | null> {
    return this.topPageModel.findById(id).exec();
  }

  async deleteById(id: string): Promise<TopPageDocument | null> {
    return this.topPageModel.findByIdAndDelete(id).exec();
  }

  async updateById(id: string, dto: Partial<CreateTopPageDto>): Promise<TopPageDocument | null> {
    return this.topPageModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async findByCategory(dto: FindTopPageDto): Promise<TopPageDocument[]> {
    return this.topPageModel
      .aggregate([
        {
          $match: {
            firstLevelCategory: dto.firstCategory,
          },
        },
        {
          $group: {
            _id: { secondCategory: '$secondCategory' },
            pages: {
              $push: { alias: '$alias', title: '$title' },
            },
          },
        },
      ])
      .exec() as Promise<TopPageDocument[]>;
  }

  async findByText(text: string): Promise<TopPageDocument[]> {
    return this.topPageModel.find({ $text: { $search: text, $caseSensitive: false } }).exec();
  }
}
