const expect = require('expect');
const { createStore } = require('redux');
const {
  reductusEnhancer, combineReducers, service, selector, reducer
} = require('../');

describe('serviceInstance', () => {

  let TestService,
      serviceInstance;

  before(() => {
    createStore(combineReducers({}), reductusEnhancer);

    @service('test', 0)
    class Test {

      constructor() {
        this._constructorDidRun = true;
      }

      onStateAvailable() {
        // throw if called a second time
        if (this._onStateAvailableDidRun) {
          throw new Error('onStateAvailable() was already invoked!');
        }

        this._onStateAvailableDidRun = true;
        this._stateUponOnStateAvailable = this.state();
      }

      @reducer()
      ADD(state, { payload }) {
        return state + payload;
      }

      @reducer()
      ERROR(state, { payload, error }) {
        return error ? payload.message : state;
      }

      @reducer()
      RESET(state) {
        return 0;
      }

      @reducer()
      META(state, { meta }) {
        return meta === 'meta' ? 'E_TOOMUCHMETA' : state;
      }

      returnSelf() {
        return this;
      }

      getSum(state) {
        return this.state();
      }

    };

    TestService = Test;
  });

  describe('constructor()', () => {
    it('should run at instantiation', () => {
      serviceInstance = TestService.get();

      expect(serviceInstance).toHaveProperty('_constructorDidRun', true);
    });
  });

  describe('onStateAvailable()', () => {

    it('should run once state is available', done => {
      setTimeout(() => {
        expect(serviceInstance).toHaveProperty('_onStateAvailableDidRun', true);
        done();
      }, 10);
    });

    it('should have access to already initialized state', () => {
      expect(serviceInstance).toHaveProperty('_stateUponOnStateAvailable', 0);
    });

    it('should not call be called again when service is returned from factory', () => {
      expect(() => TestService.get()).not.toThrow();
    });

  });

  describe('state()', () => {

    it('should return the local slice', () => {
      expect(serviceInstance.state()).toBe(0);
    });

  });

  describe('slice(state)', () => {

    it('should throw if not provided a state object', () => {
      expect(() => serviceInstance.slice()).toThrow(/without providing the "state" parameter/);
    });

    it('should return the local slice from provided state', () => {
      expect(serviceInstance.slice({ test: 7 })).toBe(7);
    });

  });

  describe('dispatch()', () => {

    it('should support dispatching raw actions', () => {
      serviceInstance.dispatch({ type: 'ADD', payload: 1 });
      expect(serviceInstance.getSum()).toBe(1);
    });

    it('should support convenience (type, payload) FSA dispatching', () => {
      serviceInstance.dispatch('ADD', 2);
      expect(serviceInstance.getSum()).toBe(3);
    });

    it('should support convenience (type, Error) FSA dispatching', () => {
      serviceInstance.dispatch('ERROR', new Error('oops'));
      expect(serviceInstance.getSum()).toBe('oops');
    });

    it('should support convenience (type, payload, meta) FSA dispatching', () => {
      serviceInstance.dispatch('META', null, 'meta');
      expect(serviceInstance.getSum()).toBe('E_TOOMUCHMETA');
    });

    it('should support convenience (type) FSA dispatching', () => {
      serviceInstance.dispatch('RESET');
      expect(serviceInstance.getSum()).toBe(0);
    });

  });

  describe('methods', () => {

    it('should be autobound', () => {
      const func = serviceInstance.returnSelf;

      expect(func()).toBe(serviceInstance);
    });

  });

});
