const expect = require('expect');
const {
  reductusEnhancer, combineReducers, selector, reducer, service
} = require('../');

describe('reductusEnhancer', () => {

  it('should be a function', () => {
    expect(typeof reductusEnhancer).toBe('function');
  });

});

describe('combineReducers', () => {

  it('should be a function', () => {
    expect(typeof combineReducers).toBe('function');
  });

});

describe('selector', () => {

  it('should be a function', () => {
    expect(typeof selector).toBe('function');
  });

});

describe('reducer', () => {

  it('should be a function', () => {
    expect(typeof reducer).toBe('function');
  });

});

describe('service', () => {

  it('should be a function', () => {
    expect(typeof service).toBe('function');
  });

});
