import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<UserModel>;

@Schema({ timestamps: true })
export class UserModel {
  id: string;

  @Prop({ type: String, unique: true })
  email: string;

  @Prop({ type: String })
  passwordHash: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
