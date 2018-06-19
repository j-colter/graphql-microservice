import { expect } from 'chai'

describe('expect', function () {
  describe('chai', function () {
    it('should be expect', () => {
      // Target object deeply (but not strictly) equals `{a: 1}`
      expect({a: 1}).to.deep.equal({a: 1});
      expect({a: 1}).to.not.equal({a: 1});

      // Target array deeply (but not strictly) includes `{a: 1}`
      expect([{a: 1}]).to.deep.include({a: 1});
      expect([{a: 1}]).to.not.include({a: 1});

      // Target object deeply (but not strictly) includes `x: {a: 1}`
      expect({x: {a: 1}}).to.deep.include({x: {a: 1}});
      expect({x: {a: 1}}).to.not.include({x: {a: 1}});

      // Target array deeply (but not strictly) has member `{a: 1}`
      expect([{a: 1}]).to.have.deep.members([{a: 1}]);
      expect([{a: 1}]).to.not.have.members([{a: 1}]);

      // Target set deeply (but not strictly) has key `{a: 1}`
      expect(new Set([{a: 1}])).to.have.deep.keys([{a: 1}]);
      expect(new Set([{a: 1}])).to.not.have.keys([{a: 1}]);

      // Target object deeply (but not strictly) has property `x: {a: 1}`
      expect({x: {a: 1}}).to.have.deep.property('x', {a: 1});
      expect({x: {a: 1}}).to.not.have.property('x', {a: 1});

      expect([1, 2]).to.have.ordered.members([1, 2])
        .but.not.have.ordered.members([2, 1]);
      expect([1, 2, 3]).to.include.ordered.members([1, 2])
        .but.not.include.ordered.members([2, 3]);

      expect(1).to.be.a('number', 'nooo why fail??');
      expect(1, 'nooo why fail??').to.be.a('number');

      expect({a: 1, b: 2, c: 3}).to.include.all.keys('a', 'b');
      expect({a: 1, b: 2, c: 3}).to.have.any.keys('a', 'b');

      expect([1, 2, 3]).to.have.lengthOf.within(2, 4); // Not recommended

      expect('foobar').to.match(/^foo/);
    });
  });
});
