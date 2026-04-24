export enum DomainErrorName {
  NOT_FOUND = 'Not Found',
  VALIDATION = 'Validation',
}

export abstract class DomainError extends Error {
  constructor(name: DomainErrorName, message: string) {
    super(message);
    this.name = name;
    Error.captureStackTrace(this, this.constructor);
  }
}
