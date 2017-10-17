import { addSlice, reduxCake, combineReducers } from 'redux-cake';
import { createSelector } from 'reselect';
import getObjectKeys from './get-object-keys';
import getBoundMethod from './get-bound-method';
import asap from './asap';
import * as validators from './validators';

const SLICE_ADDED = '@@redux-cake/SLICE_ADDED';

let store;

/**
 * A decorator for marking methods on service definitions as selectors.
 * The selector definition accepts a callback function that receives the
 * service instance, and should return an array of input selectors (in
 * `reselect` terms). The results of the input selectors will be passed
 * the function body.
 */
export const selector = getInputSelectors => (target, key, descriptor) => {
  validators.validateSelectorDecoratorParams(getInputSelectors);
  validators.validateSelectorDecoratorTarget(target, key, descriptor);

  descriptor.value._reductusSelector = { getInputSelectors };
};

/**
 * A decorator for marking methods on service definitions as reducers. Reducers
 * will not be exposed on the service's public API, but will receive dispatched
 * actions when the action type matches the (optional) type provided to the
 * decorator, or the method name if the type is excluded.
 */
export const reducer = type => (target, key, descriptor) => {
  validators.validateReducerDecoratorParams(type);
  validators.validateReducerDecoratorTarget(target, key, descriptor);

  descriptor.value._reductusReducer = { type: type || key };
};

/**
 * A decorator that will convert a class definition into a Service factory.
 */
export const service = (slice, initialState) => clazz => {
  validators.validateServiceDecoratorParams(slice, initialState);
  validators.validateServiceDecoratorTarget(clazz);

  const reducers = {};

  const proto = clazz.prototype;

  proto.state = () => {
    assertStore();

    return store.getState()[slice];
  };

  proto.slice = (state) => {
    assertStore();

    if (!state) {
      throw new Error('Cannot call slice() without providing the "state" parameter');
    }

    return state[slice];
  };

  proto.dispatch = (type, payload, meta) => {
    assertStore();

    // check if we're dispatching a raw action
    if (typeof type !== 'string') {
      return store.dispatch(type);
    }

    const action = { type };

    if (payload instanceof Error) {
      action.error = true;
    }

    if (typeof payload !== 'undefined') {
      action.payload = payload;
    }

    if (typeof meta !== 'undefined') {
      action.meta = meta;
    }

    return store.dispatch(action);
  };

  getObjectKeys(proto).forEach(key => {
    if (key === 'constructor') return;

    const descriptor = Object.getOwnPropertyDescriptor(proto, key);

    if (typeof descriptor.value !== 'function') return;

    const fn = descriptor.value;

    if (fn._reductusSelector) {
      const { getInputSelectors } = fn._reductusSelector;

      let selector;

      // note: we wrap the selector function so that we can lazily invoke
      // `getInputSelectors`. this is primarily done to allow any remaining service
      // methods to be processed by this loop before selectors start grabbing
      // references to their "input selectors"
      descriptor.value = function(...args) {
        if (selector) return selector(...args);

        selector = createSelector(getInputSelectors(this), fn.bind(this));

        return selector(...args);
      };

      Object.defineProperty(proto, key, getBoundMethod(clazz, key, descriptor));
    }
    else if (fn._reductusReducer) {
      // @todo: reducers aren't yet bound to the service instance
      reducers[fn._reductusReducer.type] = fn;
      delete proto[key];
    }
    else {
      // autobind all remaining class methods
      Object.defineProperty(proto, key, getBoundMethod(clazz, key, descriptor));
    }
  });

  let instance;

  clazz.get = () => {
    if (instance) return instance;

    instance = new clazz();

    // most of the time our services are registered before the enhancer has had
    // a chance to be applied, so we wait a tick before trying to add the slice
    addSlice(slice, (state, action) => {
      // honor `combineReducers()` state initilization procedure
      if (typeof state === 'undefined') {
        return initialState;
      }

      // call onStateAvailable() once the slice has been successfully added.
      // note: we invoke it on a future turn, as we're currently in a reducer,
      // so we don't want to let consumers call dispatch() right now (which is
      // a likely use case for this callback).
      if (
        instance.onStateAvailable &&
        action.type === SLICE_ADDED &&
        action.payload === slice
      ) {
        instance.onStateAvailable();
      }

      // bail if we don't have a specific reducer for this
      if (!reducers[action.type]) {
        return state;
      }

      return reducers[action.type].call(instance, state, action);
    });

    return instance;
  };
};

/**
 * The store enhancer used to enable dynamic slice management, dispatching,
 * and state access.
 */
export const reductusEnhancer = createStore => {
  const wrappedCreateStore = (...args) => {
    store = createStore(...args);
    return store;
  };

  return reduxCake(wrappedCreateStore);
};

/**
 * A wrapper around Redux's `combineReducers` implementation, giving us a
 * chance to intercept key actions, as well as grab a reference to the
 * raw reducers object.
 */
export { combineReducers };

// verifies that the store has been initialized (and thus asserting that
// the reductus enhaner has already been used)
function assertStore() {
  if (!store) {
    throw new Error('You must use the reductus enhancer before calling reductus Service methods');
  }
}
