export interface CategoryProps {
  id?: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
}

export class Category {
  private _id?: string;
  private _name!: string;
  private _description?: string | null;
  private _parentId?: string | null;

  constructor(props: CategoryProps) {
    this.validate(props);

    this._id = props.id;
    this._name = props.name;
    this._description = props.description ?? null;
    this._parentId = props.parentId ?? null;
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

  validateHierarchy(parentId: string) {
    if (!this._id) return;

    if (parentId === this._id) {
      throw new Error('Category cannot be related to itself');
    }
  }

  private validate(props: CategoryProps) {
    if (!props.name) {
      throw new Error('Category name is required');
    }

    if (props.parentId && props.id && props.parentId === props.id) {
      throw new Error('Category cannot be related to itself');
    }
  }
}
