import validateRoute from './validate-route';

describe('validate-route', () => {
  describe('route pattern', () => {
    it('throws error on not closed parameter signature', () => {
      expect(() => { validateRoute('/say/{message'); }).toThrow();
    });

    it('throws error on malformed parameter signature', () => {
      expect(() => { validateRoute('/say/{message()}'); }).toThrow();
    });

    it('throws error on invalid constraint', () => {
      expect(() => { validateRoute('/say/{message:()}'); }).toThrow();
      expect(() => { validateRoute('/say/{message:$()}'); }).toThrow();
    });
  });

  describe('parameter constraint', () => {
    it('throws error on unknown constraint type', () => {
      expect(() => { validateRoute('/say/{message:foo}'); }).toThrow();
    });

    it('throws error on invalid constraint', () => {
      expect(() => { validateRoute('/say/{message:range(1,2,3)}'); }).toThrow();
    });
  });
});
