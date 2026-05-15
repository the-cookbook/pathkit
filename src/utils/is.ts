import { typeOf } from './type-of';

type Nullish = null | undefined;

export const is = {
  nullish(value: unknown): value is Nullish {
    return value === null || value === undefined;
  },
  truthy<T>(value: T | Nullish): value is T {
    if (is.nullish(value)) {
      return false;
    }

    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  },
  string(value: unknown): value is string {
    return typeOf(value) === 'string';
  },
  number(value: unknown): value is number {
    return typeOf(value) === 'number' && !Number.isNaN(value);
  },
  bool(value: unknown): value is boolean {
    return typeOf(value) === 'boolean';
  },
  array: <T>(value: unknown): value is T[] => Array.isArray(value),
};
