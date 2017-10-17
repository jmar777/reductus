const expect = require('expect');
const { service, reducer, selector } = require('../');

describe('@selector validator', () => {

  it('should throw if getInputSelectors is not provided', () => {
    expect(() => {
      class Test {
        @selector()
        method() {}
      }
    }).toThrow(/getInputSelectors.*is required/);
  });

  it('should throw if getInputSelectors is not a function', () => {
    expect(() => {
      class Test {
        @selector('oops!')
        method() {}
      }
    }).toThrow(/getInputSelectors.*be a function/);
  });

  it('should throw if target is not a function', () => {
    expect(() => {
      @selector(() => [state => state])
      class Test {}
    }).toThrow(/used on class methods/);
  });

  it('should not throw if used correctly', () => {
    expect(() => {
      class Test {
        @selector(() => [state => state])
        method() {}
      }
    }).not.toThrow();
  });

});

describe('@reducer validator', () => {

  it('should throw if type is not a string', () => {
    expect(() => {
      class Test {
        @reducer({})
        method() {}
      }
    }).toThrow(/non-string `type`/);
  });

  it('should throw if target is not a function', () => {
    expect(() => {
      @reducer()
      class Test {}
    }).toThrow(/used on class methods/);
  });

  it('should not throw if used correctly with no type parameter`', () => {
    expect(() => {
      class Test {
        @reducer()
        method() {}
      }
    }).not.toThrow();
  });

  it('should not throw if used correctly with a type parameter`', () => {
    expect(() => {
      class Test {
        @reducer('FOO')
        method() {}
      }
    }).not.toThrow();
  });

});

describe('@service validator', () => {

  it('should throw if slice is not a string', () => {
    expect(() => {
      @service({}, {})
      class Test {}
    }).toThrow(/slice.*must be a string/);
  });

  it('should throw if initialState is missing', () => {
    expect(() => {
      @service('test')
      class Test {}
    }).toThrow(/initialState.*is required/);
  });

  it('should throw if target is not a class', () => {
    expect(() => {
      class Test {
        @service('test', {})
        method() {}
      }
    }).toThrow(/used on ES6 classes/);
  });

  it('should not throw if used correctly', () => {
    expect(() => {
      @service('test', {})
      class Test {}
    }).not.toThrow();
  });

  it('should throw if target already has a slice() method', () => {
    expect(() => {
      @service('test', {})
      class Test {
        slice() {}
      }
    }).toThrow(/"slice".*reserved/);
  });

  it('should throw if target already has a state() method', () => {
    expect(() => {
      @service('test', {})
      class Test {
        state() {}
      }
    }).toThrow(/"state".*reserved/);
  });

  it('should throw if target already has a dispatch() method', () => {
    expect(() => {
      @service('test', {})
      class Test {
        dispatch() {}
      }
    }).toThrow(/"dispatch".*reserved/);
  });

});
