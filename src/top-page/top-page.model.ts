import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AdvantageModel } from './models/advantages.mode';
import { HhModel } from './models/hh.model';
import { TopLevelCategory } from './types/TopLevelCategoryEnum';
import { HydratedDocument } from 'mongoose';

export type TopPageDocument = HydratedDocument<TopPageModel>;

@Schema({ timestamps: true })
export class TopPageModel {
  id: string;

  @Prop({ type: Number, enum: TopLevelCategory })
  firstLevelCategory: TopLevelCategory;

  @Prop({ type: String })
  secondCategory: string;

  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  category: string;

  @Prop({ type: String, unique: true })
  alias: string;

  @Prop({ type: HhModel })
  hh?: HhModel;

  @Prop({ type: [AdvantageModel] })
  advantages: AdvantageModel[];

  @Prop({ type: String })
  seoText: string;

  @Prop({ type: String })
  tagsTitle: string;

  @Prop({ type: [String] })
  tags: string[];
}

export const TopPageSchema = SchemaFactory.createForClass(TopPageModel);

TopPageSchema.index({ title: 'text', seoText: 'text' });
