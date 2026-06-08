import uuid from './uuid';

describe('constraints/uuid', () => {
  describe('validation', () => {
    it.each([
      ['550e8400-e29b-41d4-a716-446655440000'],
      ['00000000-0000-0000-0000-000000000000'],
      ['ffffffff-ffff-ffff-ffff-ffffffffffff'],
      ['7d444840-9dc0-11d1-b245-5ffdce74fad2'],
    ])('should not throw when value is a valid UUID "%s"', (value) => {
      expect(() => {
        uuid('id', value, '');
      }).not.toThrow();
    });

    it.each([
      [undefined],
      [''],
      ['foo'],
      ['123'],
      ['550e8400e29b41d4a716446655440000'],
      ['550e8400-e29b-41d4-a716'],
      ['550e8400-e29b-41d4-a716-446655440000-extra'],
      ['550e8400-e29b-41d4-a716-44665544000'],
      ['550e8400-e29b-41d4-a716-4466554400000'],
      ['550e8400-e29b-41d4-a716-44665544000g'],
      ['zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz'],
      ['550e8400_e29b_41d4_a716_446655440000'],
      ['550e8400/e29b/41d4/a716/446655440000'],
      [' 550e8400-e29b-41d4-a716-446655440000'],
      ['550e8400-e29b-41d4-a716-446655440000 '],
    ])('should throw when value is not a valid UUID "%s"', (value) => {
      expect(() => {
        uuid('id', value, '');
      }).toThrow(/is not a valid UUID/);
    });

    it('should throw when constraint parameters are provided', () => {
      expect(() => {
        uuid('id', '550e8400-e29b-41d4-a716-446655440000', '1');
      }).toThrow(/does not require parameter\(s\)/);
    });
  });

  describe('verify()', () => {
    it('should not throw when no constraint value is provided', () => {
      expect(() => {
        uuid.verify('id', '');
      }).not.toThrow();
    });

    it.each(['1', 'v4', 'foo', 'true'])(
      'should throw when constraint value "%s" is provided',
      (params) => {
        expect(() => {
          uuid.verify('id', params);
        }).toThrow(/does not require parameter\(s\)/);
      },
    );
  });

  describe('toRegExp()', () => {
    it('should return the uuid RegExp source', () => {
      expect(uuid.toRegExp('')).toEqual(
        '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
      );
    });

    const regexp = new RegExp(`^(?:${uuid.toRegExp('')})$`);

    it.each([
      ['550e8400-e29b-41d4-a716-446655440000'],
      ['00000000-0000-0000-0000-000000000000'],
      ['ffffffff-ffff-ffff-ffff-ffffffffffff'],
      ['7d444840-9dc0-11d1-b245-5ffdce74fad2'],
    ])('should match valid UUID "%s"', (value) => {
      expect(regexp.test(value)).toBe(true);
    });

    it.each([
      [''],
      ['foo'],
      ['550e8400e29b41d4a716446655440000'],
      ['550e8400-e29b-41d4-a716'],
      ['550e8400-e29b-41d4-a716-44665544000g'],
      ['zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz'],
      ['550e8400-e29b-41d4-a716-446655440000-extra'],
    ])('should not match invalid UUID "%s"', (value) => {
      expect(regexp.test(value)).toBe(false);
    });
  });
});
