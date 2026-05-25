import range from './range';

describe('constraints/range', () => {
  it('should return throw when there is no parameters declared', () => {
    expect(() => {
      range('page', 'foo', '');
    }).toThrow(/'range' declared for 'page' parameter expects expected 2 parameters, received 0/i);
  });

  it('should return throw when value is NaN', () => {
    expect(() => {
      range('page', 'foo', '1,3');
    }).toThrow(/'page' expects numeric value, instead got 'foo'/i);
  });

  it('should return throw when params contains NaN', () => {
    expect(() => {
      range('page', 'foo', '1,a');
    }).toThrow(/'range' declared for 'page' expects numeric parameters. Received: 'a'/i);
  });

  it('should return throw when params have more or less than 2 items', () => {
    expect(() => {
      range('page', '1', '1');
    }).toThrow(/'range' declared for 'page' parameter expects expected 2 parameters, received 1/i);
    expect(() => {
      range('page', '1', '1,2,3');
    }).toThrow(/'range' declared for 'page' parameter expects expected 2 parameters, received 3/i);
  });

  it('should match range accordingly', () => {
    expect(() => {
      range('page', '1', '1,2');
    }).not.toThrow();
    expect(new RegExp(range.toRegExp('1,2'), 'g').exec('1')?.[0]).toEqual('1');

    expect(() => {
      range('page', '2', '1,2');
    }).not.toThrow();
    expect(new RegExp(range.toRegExp('1,2'), 'g').exec('2')?.[0]).toEqual('2');

    expect(() => {
      range('page', '2', '1,3');
    }).not.toThrow();
    expect(new RegExp(range.toRegExp('1,3'), 'g').exec('2')?.[0]).toEqual('2');

    expect(() => {
      range('page', '0', '1,3');
    }).toThrow(/"page" must be a number between 1 and 3, instead received "0"/i);

    expect(() => {
      range('page', '4', '1,3');
    }).toThrow(/"page" must be a number between 1 and 3, instead received "4"/i);
  });

  describe('toRegExp()', () => {
    it('should mount RegExp string correct', () => {
      // @ts-expect-error: type error expect for test assertion
      expect(range.toRegExp()).toEqual('\\d+');
      expect(range.toRegExp('')).toEqual('\\d+');
    });
  });
});
