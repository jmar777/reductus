const expect = require('expect');
const { createStore } = require('redux');
const { reductusEnhancer, combineReducers, service, reducer } = require('../');

describe('@reducer()', () => {

  let testService;

  before(() => {

    @service('reducer-test', 0)
    class TestService {

      @reducer()
      ADD_1(state) { return state + 1 }

      @reducer('ADD_2')
      handleAdd2(state) { return state + 2 }

    }

    testService = TestService.get();

    createStore(combineReducers({}), reductusEnhancer);
  });

  it('should default to decorated method name for the action type', () => {

    testService.dispatch('ADD_1');

    expect(testService.state()).toBe(1);

  });

  it('should allow providing action type as a parameter', () => {

    testService.dispatch('ADD_2');

    expect(testService.state()).toBe(3);

  });

  it('should strip the reducer methods from the Service class', () => {

    expect(typeof testService.ADD_1).toBe('undefined');

  });

});
