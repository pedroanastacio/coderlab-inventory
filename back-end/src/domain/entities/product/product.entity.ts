import { ValidationError } from '../../errors/validation.error';

export interface ProductProps {
  id?: string;
  name: string;
  description?: string | null;
  price: number;
  categoryIds: string[];
}

export class Product {
  private _id?: string;
  private _name!: string;
  private _description?: string | null;
  private _price!: number;
  private _categoryIds!: string[];

  constructor(props: ProductProps) {
    this.validate(props);

    this._id = props.id;
    this._name = props.name;
    this._description = props.description ?? null;
    this._price = props.price;
    this._categoryIds = props.categoryIds;
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

  get price() {
    return this._price;
  }

  get categoryIds() {
    return this._categoryIds;
  }

  update(data: Partial<Omit<ProductProps, 'id'>>) {
    if (data.name !== undefined) {
      this.checkName(data.name);
      this._name = data.name;
    }

    if (data.description !== undefined) {
      this._description = data.description;
    }

    if (data.price !== undefined) {
      this.checkPrice(data.price);
      this._price = data.price;
    }

    if (data.categoryIds !== undefined) {
      this.checkCategoryIds(data.categoryIds);
      this._categoryIds = data.categoryIds;
    }
  }

  private checkName(name: string) {
    if (!name || name.trim() === '') {
      throw new ValidationError('Product name is required');
    }
  }

  private checkPrice(price: number) {
    if (price < 0) {
      throw new ValidationError('Product price cannot be negative');
    }
  }

  private checkCategoryIds(categoryIds: string[]) {
    if (!categoryIds || categoryIds.length === 0) {
      throw new ValidationError('Product must belong to at least one category');
    }
  }

  private validate(props: ProductProps) {
    this.checkName(props.name);
    this.checkPrice(props.price);
    this.checkCategoryIds(props.categoryIds);
  }
}
