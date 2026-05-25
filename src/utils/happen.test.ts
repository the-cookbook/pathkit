import happen, { type Comparison } from './happen';

describe('happen', () => {
  describe('number comparison', () => {
    it('should return true when number is equal to target', () => {
      expect(happen(10).equalTo(10)).toBe(true);
    });

    it('should return false when number is not equal to target', () => {
      expect(happen(10).equalTo(11)).toBe(false);
    });

    it('should return true when number is less than target', () => {
      expect(happen(10).lessThan(11)).toBe(true);
    });

    it('should return false when number is equal to target for less than comparison', () => {
      expect(happen(10).lessThan(10)).toBe(false);
    });

    it('should return false when number is greater than target for less than comparison', () => {
      expect(happen(10).lessThan(9)).toBe(false);
    });

    it('should return true when number is greater than target', () => {
      expect(happen(10).greaterThan(9)).toBe(true);
    });

    it('should return false when number is equal to target for greater than comparison', () => {
      expect(happen(10).greaterThan(10)).toBe(false);
    });

    it('should return false when number is less than target for greater than comparison', () => {
      expect(happen(10).greaterThan(11)).toBe(false);
    });

    it('should return true when number is less than target for less than or equal comparison', () => {
      expect(happen(10).lessThanOrEqual(11)).toBe(true);
    });

    it('should return true when number is equal to target for less than or equal comparison', () => {
      expect(happen(10).lessThanOrEqual(10)).toBe(true);
    });

    it('should return false when number is greater than target for less than or equal comparison', () => {
      expect(happen(10).lessThanOrEqual(9)).toBe(false);
    });

    it('should return true when number is greater than target for greater than or equal comparison', () => {
      expect(happen(10).greaterThanOrEqual(9)).toBe(true);
    });

    it('should return true when number is equal to target for greater than or equal comparison', () => {
      expect(happen(10).greaterThanOrEqual(10)).toBe(true);
    });

    it('should return false when number is less than target for greater than or equal comparison', () => {
      expect(happen(10).greaterThanOrEqual(11)).toBe(false);
    });

    it('should return true when number is between lower and upper bounds', () => {
      expect(happen(10).between(5, 15)).toBe(true);
    });

    it('should return true when number is equal to lower bound', () => {
      expect(happen(10).between(10, 15)).toBe(true);
    });

    it('should return true when number is equal to upper bound', () => {
      expect(happen(10).between(5, 10)).toBe(true);
    });

    it('should return false when number is lower than lower bound', () => {
      expect(happen(10).between(11, 15)).toBe(false);
    });

    it('should return false when number is greater than upper bound', () => {
      expect(happen(10).between(5, 9)).toBe(false);
    });

    it('should compare negative numbers', () => {
      expect(happen(-10).lessThan(-5)).toBe(true);
      expect(happen(-10).greaterThan(-20)).toBe(true);
      expect(happen(-10).between(-20, -5)).toBe(true);
    });

    it('should compare zero', () => {
      expect(happen(0).equalTo(0)).toBe(true);
      expect(happen(0).greaterThan(-1)).toBe(true);
      expect(happen(0).lessThan(1)).toBe(true);
    });

    it('should compare decimal numbers', () => {
      expect(happen(1.5).greaterThan(1.25)).toBe(true);
      expect(happen(1.5).lessThan(1.75)).toBe(true);
      expect(happen(1.5).between(1.25, 1.75)).toBe(true);
    });
  });

  describe('date comparison', () => {
    const before = new Date('2025-01-01T00:00:00.000Z');
    const current = new Date('2025-06-01T00:00:00.000Z');
    const sameTimestamp = new Date('2025-06-01T00:00:00.000Z');
    const after = new Date('2025-12-01T00:00:00.000Z');

    it('should return true when date is equal to the same date instance', () => {
      expect(happen(current).equalTo(current)).toBe(true);
    });

    it('should return false when date has same timestamp but different instance', () => {
      expect(happen(current).equalTo(sameTimestamp)).toBe(false);
    });

    it('should return false when same date instance is less than target', () => {
      expect(happen(current).lessThan(current)).toBe(false);
    });

    it('should return false when same date instance is greater than target', () => {
      expect(happen(current).greaterThan(current)).toBe(false);
    });

    it('should return true when same date instance is less than or equal to target', () => {
      expect(happen(current).lessThanOrEqual(current)).toBe(true);
    });

    it('should return true when same date instance is greater than or equal to target', () => {
      expect(happen(current).greaterThanOrEqual(current)).toBe(true);
    });

    it('should return true when date with same timestamp but different instance is less than target', () => {
      expect(happen(current).lessThan(sameTimestamp)).toBe(true);
    });

    it('should return false when date with same timestamp but different instance is greater than target', () => {
      expect(happen(current).greaterThan(sameTimestamp)).toBe(false);
    });

    it('should return true when date with same timestamp but different instance is less than or equal to target', () => {
      expect(happen(current).lessThanOrEqual(sameTimestamp)).toBe(true);
    });

    it('should return false when date with same timestamp but different instance is greater than or equal to target', () => {
      expect(happen(current).greaterThanOrEqual(sameTimestamp)).toBe(false);
    });

    it('should return true when date is less than target', () => {
      expect(happen(before).lessThan(current)).toBe(true);
    });

    it('should return true when date is greater than target', () => {
      expect(happen(after).greaterThan(current)).toBe(true);
    });

    it('should return true when date is between lower and upper bounds', () => {
      expect(happen(current).between(before, after)).toBe(true);
    });

    it('should return true when same date instance is used as lower bound', () => {
      expect(happen(current).between(current, after)).toBe(true);
    });

    it('should return true when same date instance is used as upper bound', () => {
      expect(happen(current).between(before, current)).toBe(true);
    });

    it('should return false when date is same timestamp as lower bound but different instance', () => {
      expect(happen(current).between(sameTimestamp, after)).toBe(false);
    });

    it('should return true when date is same timestamp as upper bound but different instance', () => {
      expect(happen(current).between(before, sameTimestamp)).toBe(true);
    });

    it('should return false when date is before lower bound', () => {
      expect(happen(before).between(current, after)).toBe(false);
    });

    it('should return false when date is after upper bound', () => {
      expect(happen(after).between(before, current)).toBe(false);
    });
  });

  describe('mixed comparison', () => {
    it('should compare date against timestamp number', () => {
      const date = new Date('2025-06-01T00:00:00.000Z');

      expect(happen(date).equalTo(date.getTime())).toBe(false);
      expect(happen(date).lessThan(date.getTime() + 1)).toBe(true);
      expect(happen(date).greaterThan(date.getTime() - 1)).toBe(true);
    });

    it('should compare timestamp number against date', () => {
      const date = new Date('2025-06-01T00:00:00.000Z');

      expect(happen(date.getTime()).equalTo(date)).toBe(false);
      expect(happen(date.getTime()).lessThan(new Date(date.getTime() + 1))).toBe(true);
      expect(happen(date.getTime()).greaterThan(new Date(date.getTime() - 1))).toBe(true);
    });
  });

  describe('type coverage', () => {
    it('should expose comparison methods', () => {
      const comparison = happen(10);

      /* eslint-disable @typescript-eslint/no-unsafe-assignment */

      expect(comparison).toEqual({
        equalTo: expect.any(Function),
        lessThan: expect.any(Function),
        greaterThan: expect.any(Function),
        lessThanOrEqual: expect.any(Function),
        greaterThanOrEqual: expect.any(Function),
        between: expect.any(Function),
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    });

    it('should match Comparison type', () => {
      expectTypeOf(happen).toEqualTypeOf<Comparison>();
    });

    it('should return comparison API', () => {
      expectTypeOf(happen(10)).toEqualTypeOf<ReturnType<Comparison>>();
    });
  });
});
