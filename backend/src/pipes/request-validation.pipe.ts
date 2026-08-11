import { BadRequestException, ValidationPipe } from '@nestjs/common';

export class RequestValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      exceptionFactory: (errors) =>
        new BadRequestException(
          errors.flatMap((error) => Object.values(error.constraints || {})),
        ),
    });
  }
}
