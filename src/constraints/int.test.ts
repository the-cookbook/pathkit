import int from './int';

describe('constraints/int', () => {
  it('should return throw when there is no parameters declared', () => {
    expect(() => {
      int('page', 'foo', '');
    }).toThrow();
  });

  it('should return throw when value is NaN', () => {
    expect(() => {
      int('page', 'foo', '');
    }).toThrow();
  });

  it('should return throw when param is defined', () => {
    expect(() => {
      int('page', 'foo', 'a');
    }).toThrow();
  });

  it('should match int accordingly', () => {
    expect(() => {
      int('page', '0', '');
    }).not.toThrow();
    expect(() => {
      int('page', '1', '');
    }).not.toThrow();
    expect(() => {
      int('page', '9', '');
    }).not.toThrow();
    expect(() => {
      int('page', '99', '');
    }).not.toThrow();
    expect(() => {
      int('page', '999', '');
    }).not.toThrow();
  });

  describe('toRegExp()', () => {
    it('should mount RegExp string correct', () => {
      // @ts-expect-error: type error expect for test assertion
      expect(int.toRegExp()).toEqual('\\d+');
      expect(int.toRegExp('')).toEqual('\\d+');
    });
  });
});
