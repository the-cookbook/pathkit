import type { LiteralSegment, ParameterSegment, RouteSegment } from '../contracts';
import { isLiteralToken, isParameterToken } from './segment-filters';

describe('segment-filter', () => {
  describe('isParameterToken', () => {
    it('should return true when segment is a parameter token', () => {
      const segment: RouteSegment = {
        type: 'parameter',
        name: 'slug',
        wildcard: false,
        optional: false,
        constraints: [],
      };

      expect(isParameterToken(segment)).toBe(true);
    });

    it('should return true when segment is a wildcard parameter token', () => {
      const segment: RouteSegment = {
        type: 'parameter',
        name: 'path',
        wildcard: true,
        optional: false,
        constraints: [],
      };

      expect(isParameterToken(segment)).toBe(true);
    });

    it('should return true when segment is an optional parameter token', () => {
      const segment: RouteSegment = {
        type: 'parameter',
        name: 'slug',
        wildcard: false,
        optional: true,
        constraints: [],
      };

      expect(isParameterToken(segment)).toBe(true);
    });

    it('should return true when segment is a constrained parameter token', () => {
      const segment: RouteSegment = {
        type: 'parameter',
        name: 'id',
        wildcard: false,
        optional: false,
        constraints: [
          {
            type: 'uuid',
            params: '',
          },
        ],
      };

      expect(isParameterToken(segment)).toBe(true);
    });

    it('should return false when segment is a literal token', () => {
      const segment: RouteSegment = {
        type: 'literal',
        value: '/articles',
      };

      expect(isParameterToken(segment)).toBe(false);
    });

    it('should narrow segment to ParameterSegment', () => {
      const segment: RouteSegment = {
        type: 'parameter',
        name: 'slug',
        wildcard: false,
        optional: false,
        constraints: [],
      };

      if (isParameterToken(segment)) {
        expectTypeOf(segment).toExtend<ParameterSegment>();
        expect(segment.name).toBe('slug');
      }
    });
  });

  describe('isLiteralToken', () => {
    it('should return true when segment is a literal token', () => {
      const segment: RouteSegment = {
        type: 'literal',
        value: '/articles',
      };

      expect(isLiteralToken(segment)).toBe(true);
    });

    it('should return true when literal token has no value', () => {
      const segment: RouteSegment = {
        type: 'literal',
      };

      expect(isLiteralToken(segment)).toBe(true);
    });

    it('should return true when literal token has empty value', () => {
      const segment: RouteSegment = {
        type: 'literal',
        value: '',
      };

      expect(isLiteralToken(segment)).toBe(true);
    });

    it('should return false when segment is a parameter token', () => {
      const segment: RouteSegment = {
        type: 'parameter',
        name: 'slug',
        wildcard: false,
        optional: false,
        constraints: [],
      };

      expect(isLiteralToken(segment)).toBe(false);
    });

    it('should narrow segment to LiteralSegment', () => {
      const segment: RouteSegment = {
        type: 'literal',
        value: '/articles',
      };

      if (isLiteralToken(segment)) {
        expectTypeOf(segment).toExtend<LiteralSegment>();
        expect(segment.value).toBe('/articles');
      }
    });
  });

  describe('exclusive guards', () => {
    it('should classify literal token only as literal', () => {
      const segment: RouteSegment = {
        type: 'literal',
        value: '/articles',
      };

      expect(isLiteralToken(segment)).toBe(true);
      expect(isParameterToken(segment)).toBe(false);
    });

    it('should classify parameter token only as parameter', () => {
      const segment: RouteSegment = {
        type: 'parameter',
        name: 'slug',
        wildcard: false,
        optional: false,
        constraints: [],
      };

      expect(isParameterToken(segment)).toBe(true);
      expect(isLiteralToken(segment)).toBe(false);
    });
  });
});
