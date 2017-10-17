//
// @selector()
//

export const validateSelectorDecoratorParams = getInputSelectors => {
  if (typeof getInputSelectors === 'undefined') {
    throw new Error('The getInputSelectors parameter for @selector() is required.');
  }

  if (typeof getInputSelectors !== 'function') {
    throw new Error('Expected the getInputSelectors parameter for @selector() to be a function');
  }
};

export const validateSelectorDecoratorTarget = (target, key, descriptor) => {
  if (!descriptor || typeof descriptor.value !== 'function' || typeof target.constructor !== 'function') {
    throw new Error('@selector() may only be used on class methods.');
  }
};

//
// @reducer()
//

export const validateReducerDecoratorParams = type => {
  if (type && typeof type !== 'string') {
    throw new Error('Unexpected non-string `type` provided to @reducer().');
  }
};

export const validateReducerDecoratorTarget = (target, key, descriptor) => {
  if (!descriptor || typeof descriptor.value !== 'function' || typeof target.constructor !== 'function') {
    throw new Error('@reducer() may only be used on class methods.');
  }
};

//
// @service()
//

export const validateServiceDecoratorParams = (slice, initialState) => {
  if (typeof slice !== 'string') {
    throw new Error('The first parameter (slice) for @service() must be a string.');
  }

  if (typeof initialState === 'undefined') {
    throw new Error('The second second parameter (initialState) for @service() is required.');
  }
};

export const validateServiceDecoratorTarget = clazz => {
  if (typeof clazz !== 'function' || typeof clazz.prototype.constructor !== 'function') {
    throw new Error('@service() may only be used on ES6 classes.');
  }

  ['state', 'slice', 'dispatch'].forEach(key => {
    if (clazz.prototype[key]) {
      throw new Error(`"${key}" is a reserved method name on Reductus services.`);
    }
  });
};
