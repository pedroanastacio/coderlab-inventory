import { ValidationError } from '../../errors/validation.error';

export interface CategoryProps {
  id?: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Category {
  private _id: string;
  private _name!: string;
  private _description?: string | null;
  private _parentId?: string | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: CategoryProps) {
    this.validate(props);

    this._id = props.id ?? crypto.randomUUID();
    this._name = props.name;
    this._description = props.description ?? null;
    this._parentId = props.parentId ?? null;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get description() {
    return this._description;
  }

  get parentId() {
    return this._parentId;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  validateHierarchy(parentId: string) {
    if (!this._id) return;

    if (parentId === this._id) {
      throw new ValidationError('Category cannot be related to itself');
    }
  }

  private validate(props: CategoryProps) {
    if (!props.name) {
      throw new ValidationError('Category name is required');
    }

    if (props.parentId && props.id && props.parentId === props.id) {
      throw new ValidationError('Category cannot be related to itself');
    }
  }
}
