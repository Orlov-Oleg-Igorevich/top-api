import { Prop } from '@nestjs/mongoose';

export class HhModel {
  @Prop({ type: Number })
  count: number;

  @Prop({ type: Number })
  juniorSalary: number;

  @Prop({ type: Number })
  middleSalary: number;

  @Prop({ type: Number })
  seniorSalary: number;
}
