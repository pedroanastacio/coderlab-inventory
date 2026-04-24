import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import {
  DomainError,
  DomainErrorName,
} from '../../../domain/errors/domain.error';

interface ResponseObject {
  status: (code: number) => ResponseObject;
  json: (body: object) => void;
}

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<ResponseObject>();

    const domainError = exception as DomainError;
    const status = this.getHttpStatus(domainError.name as DomainErrorName);

    response.status(status).json({
      statusCode: status,
      message: domainError.message,
      error: domainError.name,
    });
  }

  private getHttpStatus(errorName: DomainErrorName): number {
    switch (errorName) {
      case DomainErrorName.NOT_FOUND:
        return HttpStatus.NOT_FOUND;
      case DomainErrorName.VALIDATION:
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
