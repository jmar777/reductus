const expect = require('expect');
const { createStore } = require('redux');
const { reductusEnhancer, combineReducers, service } = require('../');

describe('Service.get()', () => {

  it('should provide singleton instance behavior', () => {
    @service('test', 0)
    class Test {};

    createStore(combineReducers({}), reductusEnhancer);

    expect(Test.get()).toBe(Test.get());
  });

});
