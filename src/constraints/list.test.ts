import list from './list';

describe('constraints/list', () => {
  it('should throw when param value is nullish', () => {
    expect(() => {
      // @ts-expect-error: wrong type for testing purpose
      list('foo', null, 'home|profile');
    }).toThrow('Parameter "foo" must be one of: home, profile, instead got \'null\'');
  });

  it('should throw when params is nullish', () => {
    expect(() => {
      // @ts-expect-error: wrong type for testing purpose
      list('foo', null, null);
    }).toThrow('Parameter "foo" requires a list of allowed values');
  });

  it('should use pipe char "|" to split params into list items', () => {
    expect(() => {
      list('page', 'profile', 'home|profile|settings');
    }).not.toThrow();

    expect(() => {
      list('page', 'profile', 'home.profile.settings');
    }).toThrow('Parameter "page" must be one of: home.profile.settings, instead got \'profile\'');

    expect(() => {
      list('page', 'user.profile', 'user.profile');
    }).not.toThrow();
  });

  it('should match with a single list item', () => {
    expect(() => {
      list('page', 'home', 'home');
    }).not.toThrow();
  });

  describe('toRegExp()', () => {
    it('should mount RegExp string correct', () => {
      expect(list.toRegExp('foo')).toEqual('(?:foo)');
      expect(list.toRegExp('foo|bar')).toEqual('(?:foo|bar)');
    });
  });
});
