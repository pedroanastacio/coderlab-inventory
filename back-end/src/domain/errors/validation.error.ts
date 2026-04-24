import { DomainError, DomainErrorName } from './domain.error';

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(DomainErrorName.VALIDATION, message);
  }
}
