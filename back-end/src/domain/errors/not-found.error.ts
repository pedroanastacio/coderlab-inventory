import { DomainError, DomainErrorName } from './domain.error';

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(DomainErrorName.NOT_FOUND, message);
  }
}
