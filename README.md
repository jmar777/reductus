# Reductus

> A boilerplate-adverse library for state management and code organization in Redux applications.

## Table of Contents

* **[Motivation](#motivation)**
* **[Example](#example)**
* **[Getting Started](#getting-started)**
    * [Installing Reductus](#installing-reductus)
    * [Configuring webpack](#configuring-webpack)
    * [Initial Setup](#initial-setup)
* **[API](#api)**
    * *Store Initialization:*
        * [`reductusEnhancer`](#reductusEnhancer)
        * [`combineReducers([reducers])`](#combinereducersreducers)
    * *Service Decorators:*
        * [`@service(slice, initialState)`](#serviceslice-initialstate)
        * [`@reducer([actionType])`](#reduceractiontype)
        * [`@selector(inputSelectorFactory)`](#selectorinputselectorfactory)
    * *Service Methods:*
        * [`constructor()`](#constructor)
        * [`onReady()`](#onready)
        * [`state()`](#state)
        * [`slice(state)`](#slicestate)
        * [`dispatch(actionOrType [, payload [, meta]])`](#dispatchactionortype-payload-meta)
        * [`Custom Service Methods`](#custom-service-methods)
* **[Contributing](#contributing)**

## Motivation

Every time I read through the Redux documentation, I find myself drawn to the elegant simplicity of it. The predictability and tooling benefits that it affords to complex JavaScript applications have justifiably given rise to a large and growing ecosystem around the tiny Redux core library.

While I've found that Redux applications hold true to their promise of being easy to reason about, I've also frequently found myself frustrated or fatigued by the verbosity that tends to accompany Redux applications; I've seen this sentiment in coworkers and other members of the Redux community as well. In addition to the verbosity, I've found that strict adherence to popular scaffolding examples often leads to highly fragmented business logic, as code separation is typically encouraged to reflect Redux's unidirectional data flow, rather than being structured around a natural decomposition of the application's distinctive functionality.

These aren't shortcomings in Redux, so much as concerns that fall outside of its scope. Reductus is an attempt to address these concerns through a minimal API that encourages the colocation of related reducers, action dispatchers, selectors, and business logic. This is primarily accomplished through the introduction of [`Services`](#serviceslice-initialstate), which provide a boilerplate-adverse syntax for domain-oriented code organization. 

Specific goals of Reductus are as follows:

* **Embrace Redux's strengths.**
  We want to be a useful interface to Redux, not a replacement for it.
* **Reduce boilerplate without introducing magic.**
  Reducing boilerplate through abstraction has a point of diminishing returns, and libraries that over-attack the problem can foster obscure, unexpected results. Reducers, selectors, and other primitives should remain just that.
* **Promote domain-oriented code organization.**
  If you're a fan of the ["ducks"](https://github.com/erikras/ducks-modular-redux) approach to modular Redux code organization, then Reductus may appeal to you. While Reductus is not an implementation of the ducks proposal, parts of it are born from a similar school of thought.
* **Support efficient code splitting.**
  `Services` are self-registering with the Redux store, allowing them to be dynamically loaded at any point in your application's life cycle. Removing them as a dependency at store initialization enables more efficient, granular code splitting.
* **Remain as lightweight as possible.**
  Reductus currently weighs in at ~7kb (*~2.5kb gzipped*).

## Example:

The following is code is extracted from the official Redux [Todos example](https://github.com/reactjs/redux/tree/master/examples/todos), and shows the reducers, actions, and store registration related to the "Visibility Filter":

> ⚠️ This isn't the Reductus version yet. Keep scrolling!

```js
//
// actions/index.js
//
export const setVisibilityFilter = (filter) => ({
  type: 'SET_VISIBILITY_FILTER',
  filter
});

//
// reducers/visibilityFilter.js
//
const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

export default visibilityFilter;

//
// reducers/index.js
//
import { combineReducers } from 'redux';
import visibilityFilter from './visibilityFilter';

const todoApp = combineReducers({
  visibilityFilter
});

export default todoApp;
```

Here is the equivalent when implemented as a Reductus `Service`:

```js
//
// services/VisibilityService.js
//
import { service, reducer } from 'reductus';

@service('visibilityFilter', 'SHOW_ALL')
class VisibilityService {

  @reducer()
  SET_VISIBILITY_FILTER(state, { payload }) {
    return payload;
  }

  setVisibilityFilter(filter) {
    this.dispatch('SET_VISIBILITY_FILTER', filter);
  }

}

export default VisibilityService.get();
```

While the above example departs noticeably from canonical examples for Redux code organization, it exhibits a considerable reduction in boilerplate, features a desirable colocation of related logic, and hopefully still feels "reduxy". The reducer is just a reducer, and aside from some first-class support for [FSA](https://github.com/acdlite/flux-standard-action), there's nothing fancy about our action dispatcher.

If you're wondering why we dispatch the action directly, rather than using an [action creator](http://redux.js.org/docs/basics/Actions.html#action-creators), read the documentation for [`dispatch()`](#dispatchactionortype-payload-meta) below. And if you're not feeling ready to let go of your action creators just yet, then no worries - you can keep them!

> ⓘ Note: the above example didn't show store creation, so it's not a 100% fair comparison. With Reductus, store creation is a [one-time step](#initial-setup) that doesn't need to be updated for individual `Services`, so there's nothing unique from the `VisibilityService` to show.

## Getting Started

### Installing Reductus

```sh
$ npm install reductus --save
```

### Configuring webpack

Using the decorator syntax will require the [`babel-plugin-transform-decorators-legacy`](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy) transform. To see an example of configuring `babel-loader` to use the decorator transform, please view the `webpack.config.js` file in the accompanying todos example.

### Initial Setup

To use Reductus you will need to:

1. Use the Reductus [store enhancer](#reductusenhancer).
2. Use _our_ version of  [`combineReducers`](#combinereducersreducers) as your root reducer.

> ⓘ Note that our `combineReducers` is just a wrapper around Redux's, but for [technical reasons](https://github.com/reactjs/redux/issues/2613), is a necessity.

For a basic setup, that will look like this:

```js
import { createStore } from 'redux';
import { reductusEnhancer, combineReducers } from 'reductus';

const store = createStore(combineReducers(), reductusEnhancer);
```

If you have multiple enhancers to apply, you'll need to use Redux's [`compose()`](https://github.com/reactjs/redux/blob/master/docs/api/compose.md):

```js
import { createStore, compose, applyMiddleware } from 'redux';
import { reductusEnhancer, combineReducers } from 'reductus';
import thunk from 'redux-thunk';

const store = createStore(combineReducers(), compose(
  reductusEnhancer,
  applyMiddleware(thunk)
));
```

Reductus is forgiving of race conditions during initialization, such that you can define and create your Services before actually creating the store. If it is detected that you created a Service instance, but *haven't* initialized your store with the Reductus store enhancer in a reasonable period of time, then a warning will be logged.

## API

### `reductusEnhancer`

This is the [store enhancer](https://github.com/reactjs/redux/blob/master/docs/Glossary.md#store-enhancer) that enables `Services` to be dynamically created and registered with your Redux store. You don't need to do anything with this other than pass it to `createStore()` during app initialization.

For an example please review the [initial setup](#initial-setup) section.

### `combineReducers([reducers])`

This is a wrapper around Redux's default  `combineReducers`, and should be used as your root reducer when creating your Redux store. The wrapper retains API compatibility, with the only difference being that `reducers` is now optional.

**Arguments:**

* `reducers` ~ *`Object (optional)`*: An object whose keys represent slices of state, and whose corresponding values are reducer functions for their respective slices. If this is unfamiliar to you, please see the related [Redux documentation](http://redux.js.org/docs/api/combineReducers.html).

**Returns:**

The root reducer that you should supply to `createStore()`.
  
**Example:**

```javascript
import { combineReducers } from 'reductus';
import todosReducer from './reducers/todos';

const rootReducer = combineReducers({
  todos: todosReducer
});

// OR if you don't need to register anything up front:
const rootReducer = combineReducers();
```

### `@service(slice, initialState)`

`Services` are your primary building blocks for state management in Reductus. Each `Service` is responsible for a single "slice" of state (where *slice* is used in the [`combineReducers()`](http://redux.js.org/docs/api/combineReducers.html) sense).

The `@service` decorator itself is used to transform an ES2015/ES6 class into a `ServiceFactory`, which in turn exposes a single static `get()` method. The `get()` method enforces [singleton](https://en.wikipedia.org/wiki/Singleton_pattern) behavior for your service, such that multiple invocations will always return the same instance.

**Arguments:**

* `slice` ~ *`String (required)`*: A string that indicates which slice of state this `Service` will be responsible for managing. Note that this should be unique within your application.
* `initialState` ~ *`Any (required)`*: A value (of any type) that will be used as the initial state for this `Service's` slice. *Important*: your initial state can be *anything* except for `undefined` ([read more](http://redux.js.org/docs/api/combineReducers.html#notes)). Consider `null` instead if you need an initial state for "nothing".

**Example:**

```js
import { service } from 'reductus';

@service('todos', [])
class TodoService {
  // reducers, selectors, and other
  // methods will go here...
}

export default TodoService.get();
```

> ⓘ In the example above, the instantiated `Service` will be auto-registered with the Redux store as soon as `get()` is called. This is accomplished through the `reductusEnhancer`, so there's no need to manually register your `Services` upon store creation.

#### `@reducer([actionType])`

The `@reducer()` decorator is used for marking methods on `Services` as reducers. The resulting reducers will *not* be available as methods on `Service` instances, but *will* have actions dispatched to them (depending on the action type).

The reducer method itself should simply be a [standard Redux reducer](http://redux.js.org/docs/basics/Reducers.html#handling-actions), in the form of `(previousState, action) => nextState`.

**Arguments:**

* `actionType` ~ *`String (optional)`*: A string that indicates which actions (filtered by _type_) the decorated reducer should receive. If `actionType` is omitted, then the decorated method's _name_ will be used as the action type.

**Example:**

```js
import { service, reducer } from 'reductus';
import { ADD_TODO } from './action-types';

@service('todos', [])
class TodoService {

  // use the method name as the action type:
  @reducer()
  ADD_TODO(state, { payload }) {
    return [...state, payload];
  }

  // OR, if you want to use a computed action type:
  @reducer(ADD_TODO)
  handleAddTodo(state, { payload }) { /*...*/ }

  // OR, *future* syntax, once supported by Babel 7:
  @reducer()
  [ADD_TODO](state, { payload }) { /*...*/ }
 
}
```

#### `@selector(inputSelectorFactory)`

The `@selector()` decorator provides a convenient syntax for converting a method into a [reselect selector](https://github.com/reactjs/reselect). Selectors are useful for efficiently creating and retrieving computed data from the current application state.

Under the hood, the `@selector()` decorator uses reselect's [`createSelector()`](https://github.com/reactjs/reselect#createselectorinputselectors--inputselectors-resultfunc) method to create a memoized selector. The `inputSelectors` are provided to the decorator itself, by way of a factory function, and the decorated method serves as the `resultFunc` (yes, that's confusing, but the examples are more clear).

**Arguments:**

* `inputSelectorFactory` ~ *`Function (required)`*: A function that receives the current `Service` as its only parameter, and returns an array of *selectors*. Selectors are functions that receive the current state, and return some computed data representation from it.

**Example:**

```js
import { service, selector } from 'reductus';

@service('favoriteThings', { movies: [], books: [] })
class FavoriteThingsService {

  getFavoriteMovies(state) {
    return this.slice(state).movies;
  }

  @selector(service => [service.getFavoriteMovies])
  getTop5Movies(movies) {
    return movies.slice(0, 5);
  }
 
}
```

> ⓘ *Why do we need a factory method for the `inputSelectors`?*
> Great question! The method decorators, including `@selector()`, run *before* instantiation, and even before the class is fully shaped. We use the factory function as an easy way to provide you with valid references to your input selectors.

### `constructor()`

If your `Service` class requires initialization logic at instantiation, you can use the standard [class constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor) method. It has no special significance in Reductus, but it's available if you need it.

> ⓘ It is possible (even likely) that your `constructor()` method may run *before* your store and initial state have been initialized. Most of the time it will be better for you to use the [`onReady()`](#onready) lifecycle hook instead.

**Example:**

```js
import { service } from 'reductus';

@service('todos', [])
class TodoService {

  constructor() {
    // Hi, this is some initialization logic
    // that probably should have gone inside
    // of `onReady` instead!
  }

}
```

### `onReady()`

`Service` classes may define an `onReady()` method, which is a lifecycle hook that will be invoked as soon as the `Service's` slice has been successfully registered with the Redux store.

This will typically be your best location for any initialization logic, such as fetching application state from a web service.

**Example:**

```js
import { service } from 'reductus';
import UIService from './ui-service';
import { fetchTodos } from '../lib/api';

@service('todos', [])
class TodoService {

  onReady() {
    fetchTodos().then(
      todos => this.dispatch('UPDATE_TODOS', todos),
      err => UIService.handleAPIError(err)
    );
  }

}

export default TodoService.get();
```

### `state()`

All `Service` instances have access to a `state()` method, which returns the `Service's` current slice of state.

> ⓘ Note that in most cases we recommend using `this.slice(state)` instead. See the documentation [below](#slicestate) for more details.

**Example:**

```js
import { service } from 'reductus';

@service('todos', [
  { id: 0, text: 'Butter', completed: false },
  { id: 1, text: 'Bread', completed: true }
])
class TodoService {
 
  getCompleted() { 
    return this.state().filter(todo => todo.completed); 
  } 

}
```

### `slice(state)`

When given a *store-level* state object, `slice()` will return the current `Service's` slice of state.

Even though the result will typically be the same as calling `this.state()`, we typically recommend using this instead (especially for state selectors). Computing derived data from a provided state object makes your selectors easier to test.

The following example is the same as the one above for [`this.state()`](#state), but uses `this.slice(state)` instead.

**Example:**

```js
import { service } from 'reductus';

@service('todos', [
  { id: 0, text: 'Butter', completed: false },
  { id: 1, text: 'Bread', completed: true }
])
class TodoService {
 
  getCompleted(state) { 
    return this.slice(state).filter(todo => todo.completed); 
  } 

}
```

### `dispatch(actionOrType [, payload [, meta]])`

While nothing about Reductus prohibits the use of formal action creators, it does encourage you to dispense with some of the surrounding pomp and circumstance. In lieu of *action creators*, Reductus prescribes *action dispatchers*, which is just a made up term for action-dispatching methods.

To facilitate this, all `Service` methods have direct access to `this.dispatch()`, which is simply a passthrough to the Redux store's `dispatch()` method, combined with some convenience overloads for [Flux Standard Actions](https://github.com/acdlite/flux-standard-action).

The following parameter signatures are supported:

* **`dispatch(action)`**

  
  Dispatching a regular [Redux action](http://redux.js.org/docs/basics/Actions.html) (any plain JavaScript object with a `type` property) will result in the unmodified action being dispatched to the Redux store.
  
* **`dispatch(type [, payload [,meta]])`**

  As was mentioned above, `this.dispatch()` has first-class support for [Flux Standard Actions](https://github.com/acdlite/flux-standard-action) built in. Please look at the following examples to understand usage:
  
  **Example:** `dispatch(type)`
  
  ```js
  this.dispatch('ADD_TODO')
  // resulting dispatched action:
  {
      type: 'ADD_TODO'
  }
  ```

  **Example:** `dispatch(type, payload)`
  ```js
  this.dispatch('ADD_TODO', { text: 'Milk' })
  // resulting dispatched action:
  {
      type: 'ADD_TODO',
      payload: { text: 'Milk' }
  }
  ```
  **Example:** `dispatch(type, payload, meta)`

  ```js
  this.dispatch('ADD_TODO', { text: 'Milk' }, { tags: ['shopping', 'groceries'] })
  // resulting dispatched action:
  {
      type: 'ADD_TODO',
      payload: { foo: 'bar' },
      meta: { tags: ['shopping', 'groceries'] } 
  }
  ```
  
  **Example:** `dispatch(type, errorPayload)`

  ```js
  this.dispatch('TOGGLE_TODO', new Error('Could not find the specified Todo item!'))
  // resulting dispatched action:
  {
      type: 'TOGGLE_TODO',
      payload: /* Error: 'Could not find the specified Todo item!' */,
      error: true
  }
  ```

### Custom `Service` Methods

As demonstrated in many of the examples, you can define custom methods on your `Service` classes. These methods have access to the built-in methods described above, which makes it trivial to implement your own action dispatchers, state selectors, and other business logic related to your `Service`.

Please note that all class methods are auto-bound to the service instance, which makes them convenient for passing around as function references. The example below demonstrates a custom method (`addTodo()`) that could be passed around as an action dispatcher:

**Example:**

```js
import { service } from 'reductus';

let nextTodoId = 0;

@service('todos', [])
class TodoService {

  @reducer()
  ADD_TODO(state, { payload }) {
    return [ ...state, payload ];
  }

  addTodo(text) {
    this.dispatch('ADD_TODO', this.buildTodo(text));
  }

  buildTodo(text) {
    return { text, id: nextTodoId++, completed: false };
  }

});
```

## Contributing

Pull requests are welcome, but I recommend filing an issue to discuss feature proposals first.

To get started:

1. Install dependencies:
  ```sh
  $ npm install
  ```

2. For local development, there is a watch server that will automatically generate new development (non-uglified) builds:
  ```sh
  $ npm run dev
  ```

3. To create a release (uglified) build:
  ```sh
  $ npm run build
  ```

4. To run the test suite:

  *Note: redux is a peer dependency. If you haven't installed it yet, then do that now:*
  ```sh
  $ npm install redux
  ```
  *...and then run the test suite:*
  ```sh
  $ npm test
  ```
