const expect = require('expect');
const { createStore } = require('redux');
const { service } = require('../');

describe('@service()', () => {

  let TestService;

  before(() => {
    @service('service-test', 0)
    class Test {}

    TestService = Test;
  });

  it('should convert a class definition into a Service factory', () => {

    expect(typeof TestService.get).toBe('function');

  });

});
