const expect = require('expect');
const { createStore } = require('redux');
const { reductusEnhancer, combineReducers, service, selector } = require('../');

describe('@selector()', () => {

  let testService;

  before(() => {

    @service('selector-test', [])
    class TestService {

      getVal1(state) { return state[0]; }

      getVal2(state) { return state[1]; }

      getVal3(state) { return state[2]; }

      @selector(service => [
        service.getVal1, service.getVal2, service.getVal3
      ])
      getSum(val1, val2, val3) {
        return val1 + val2 + val3;
      }

    }

    testService = TestService.get();

    createStore(combineReducers({}), reductusEnhancer);
  });

  it('should construct reselect selector using callback results', () => {

    expect(testService.getSum([1, 2, 3])).toBe(6);

  });

});
