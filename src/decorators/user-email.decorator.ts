import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserEmail = createParamDecorator((data: unknown, context: ExecutionContext) => {
  return context.switchToHttp().getRequest().user;
});
