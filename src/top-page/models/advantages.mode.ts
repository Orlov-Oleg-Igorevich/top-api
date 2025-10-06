import { Prop } from '@nestjs/mongoose';

export class AdvantageModel {
  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  description: string;
}
