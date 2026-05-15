import regex from './regex';

describe('constraints/regex', () => {
  it('should throw when there are no parameters declared', () => {
    expect(() => {
      // @ts-expect-error: wrong type for testing purpose
      regex('page', 'foo', null);
    }).toThrow("Constraint 'regex' declared for 'page' expects a regular expression parameter.");
  });

  it('should throw when param value is nullish', () => {
    expect(() => {
      // @ts-expect-error: wrong type for testing purpose
      regex('page', null, '\\d');
    }).toThrow('Parameter "page" failed to match the regular expression \\d');
  });

  it('should throw error when params is nullish', () => {
    expect(() => {
      // @ts-expect-error: wrong type for testing purpose
      regex('page', null, null);
    }).toThrow("Constraint 'regex' declared for 'page' expects a regular expression parameter.");
  });

  it('should match regex accordingly', () => {
    expect(() => {
      regex('page', '1', '\\d');
    }).not.toThrow();

    expect(() => {
      regex('page', '2', '[0-9]');
    }).not.toThrow();

    expect(() => {
      regex('page', '2', '[0-9]{2}');
    }).toThrow();

    expect(() => {
      regex('page', '0', '[a-z]');
    }).toThrow();

    expect(() => {
      regex('page', 'hello', '[a-z]');
    }).not.toThrow();

    expect(() => {
      regex('page', 'hello', '^[a-z]+$');
    }).not.toThrow();

    expect(() => {
      regex(
        'page',
        'd3aa88e2-c754-41e0-8ba6-4198a34aa0a2',
        '^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$',
      );
    }).not.toThrow();
  });

  describe('toRegExp()', () => {
    it('should mount RegExp string correct', () => {
      expect(regex.toRegExp('\\d+')).toEqual('\\d+');
      expect(regex.toRegExp('[\\w]')).toEqual('[\\w]');
    });

    it('should remove start of line and end of line anchors', () => {
      expect(regex.toRegExp('^\\d+')).toEqual('\\d+');
      expect(regex.toRegExp('\\d+$')).toEqual('\\d+');
      expect(regex.toRegExp('^\\d+$')).toEqual('\\d+');
      expect(regex.toRegExp('^[\\w]')).toEqual('[\\w]');
      expect(regex.toRegExp('[\\w]$')).toEqual('[\\w]');
      expect(regex.toRegExp('^[\\w]$')).toEqual('[\\w]');
    });
  });
});
