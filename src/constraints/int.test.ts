import int from './int';

describe('constraints/int', () => {
  it('should throw when unexpected parameters are provided', () => {
    expect(() => {
      int('page', '1', 'foo');
    }).toThrow(
      /'int' declared for 'page' parameter does not require parameter\(s\), but got '\(foo\)'/,
    );
  });

  it('should return throw when value is NaN', () => {
    expect(() => {
      int('page', 'foo', '');
    }).toThrow(/must be a number, instead got 'string'/i);
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
    expect(new RegExp(int.toRegExp(''), 'g').exec('0')?.[0]).toEqual('0');

    expect(() => {
      int('page', '1', '');
    }).not.toThrow();
    expect(new RegExp(int.toRegExp(''), 'g').exec('1')?.[0]).toEqual('1');

    expect(() => {
      int('page', '9', '');
    }).not.toThrow();
    expect(new RegExp(int.toRegExp(''), 'g').exec('9')?.[0]).toEqual('9');

    expect(() => {
      int('page', '99', '');
    }).not.toThrow();
    expect(new RegExp(int.toRegExp(''), 'g').exec('99')?.[0]).toEqual('99');

    expect(() => {
      int('page', '999', '');
    }).not.toThrow();
    expect(new RegExp(int.toRegExp(''), 'g').exec('999')?.[0]).toEqual('999');
  });

  describe('toRegExp()', () => {
    it('should mount RegExp string correct', () => {
      // @ts-expect-error: type error expect for test assertion
      expect(int.toRegExp()).toEqual('\\d+');
      expect(int.toRegExp('')).toEqual('\\d+');
    });
  });
});
