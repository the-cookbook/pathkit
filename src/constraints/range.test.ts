import range from './range';

describe('constraints/range', () => {
  it('should return throw when there is no parameters declared', () => {
    expect(() => { range('page', 'foo', ''); }).toThrow();
  });

  it('should return throw when value is NaN', () => {
    expect(() => { range('page', 'foo', '1,3'); }).toThrow();
  });

  it('should return throw when params contains NaN', () => {
    expect(() => { range('page', 'foo', '1,a'); }).toThrow();
  });

  it('should return throw when params have more or less than 2 items', () => {
    expect(() => { range('page', '1', '1'); }).toThrow();
    expect(() => { range('page', '1', '1,2,3'); }).toThrow();
  });

  it('should match range accordingly', () => {
    expect(() => { range('page', '1', '1,2'); }).not.toThrow();
    expect(() => { range('page', '2', '1,2'); }).not.toThrow();
    expect(() => { range('page', '2', '1,3'); }).not.toThrow();
    expect(() => { range('page', '0', '1,3'); }).toThrow();
    expect(() => { range('page', '4', '1,3'); }).toThrow();
  });

  describe('toRegExp()', () => {
    it('should mount RegExp string correct', () => {
      // @ts-expect-error: type error expect for test assertion
      expect(range.toRegExp()).toEqual('\\d+');
      expect(range.toRegExp('')).toEqual('\\d+');
    });
  });
});
