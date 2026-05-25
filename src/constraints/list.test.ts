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

  it('should throw when params is not part from the list', () => {
    expect(() => {
      list('foo', 'contact', 'home|profile|settings');
    }).toThrow(/Parameter "foo" must be one of: home, profile, settings, instead got 'contact'/i);
  });

  it('should use pipe char "|" to split params into list items', () => {
    expect(() => {
      list('page', 'profile', 'home|profile|settings');
    }).not.toThrow();
    expect(new RegExp(list.toRegExp('home|profile|settings'), 'g').exec('home')?.[0]).toEqual(
      'home',
    );
  });

  it('should match with a single list item', () => {
    expect(() => {
      list('page', 'home', 'home');
    }).not.toThrow();

    expect(new RegExp(list.toRegExp('home'), 'g').exec('home')?.[0]).toEqual('home');

    expect(() => {
      list('page', 'user.profile', 'user.profile');
    }).not.toThrow();

    expect(new RegExp(list.toRegExp('user.profile'), 'g').exec('user.profile')?.[0]).toEqual(
      'user.profile',
    );
  });

  describe('toRegExp()', () => {
    it('should mount RegExp string correct', () => {
      expect(list.toRegExp('foo')).toEqual('(?:foo)');
      expect(list.toRegExp('foo|bar')).toEqual('(?:foo|bar)');
    });
  });
});
