import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';
import { ID_VALIDATION_EXCEPTION } from './id-validation.constans';

@Injectable()
export class IdValidationPipes implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (metadata.type == 'param' && !Types.ObjectId.isValid(value)) {
      throw new BadRequestException(ID_VALIDATION_EXCEPTION);
    }
    return value;
  }
}
