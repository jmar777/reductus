import React from 'react';
import { render } from 'react-dom';
import { compose, createStore } from 'redux';
import { Provider } from 'react-redux';
import App from './components/App';
import { reductusEnhancer, combineReducers } from '../../../';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(combineReducers({}), composeEnhancers(reductusEnhancer));

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
