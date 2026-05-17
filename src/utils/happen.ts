type ComparisonType = number | Date;

type Comparison = (a: ComparisonType) => {
  equalTo(b: ComparisonType): boolean;
  lessThan(b: ComparisonType): boolean;
  greaterThan(b: ComparisonType): boolean;
  lessThanOrEqual(b: ComparisonType): boolean;
  greaterThanOrEqual(b: ComparisonType): boolean;
  between(b: ComparisonType, c: ComparisonType): boolean;
};

const defaultCompare = (source: ComparisonType, target: ComparisonType): number => {
  if (source === target) {
    return 0;
  }

  return source > target ? 1 : -1;
};

const happen: Comparison = (a: ComparisonType): ReturnType<Comparison> => {
  const comparer = defaultCompare;

  return {
    equalTo(b: ComparisonType): boolean {
      return comparer(a, b) === 0;
    },
    lessThan(b: ComparisonType): boolean {
      return comparer(a, b) < 0;
    },
    greaterThan(b: ComparisonType): boolean {
      return comparer(a, b) > 0;
    },
    lessThanOrEqual(b: ComparisonType): boolean {
      return this.lessThan(b) || this.equalTo(b);
    },
    greaterThanOrEqual(b: ComparisonType): boolean {
      return this.greaterThan(b) || this.equalTo(b);
    },
    between(b: ComparisonType, c: ComparisonType): boolean {
      return this.greaterThanOrEqual(b) && this.lessThanOrEqual(c);
    },
  };
};

export type { Comparison };
export default happen;
