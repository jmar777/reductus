import { createServiceFactory, service, selector, reducer } from '../../../../';
import VisibilityService from './VisibilityService';

let nextTodoId = 0;

@service('todos', [])
class TodoService {

  @reducer()
  ADD_TODO(state, { payload: { id, text } }) {
    return [...state, { id, text, completed: false }];
  }

  @reducer()
  TOGGLE_TODO(state, { payload }) {
    return state.map(todo =>
      (todo.id === payload) ? { ...todo, completed: !todo.completed } : todo
    );
  }

  addTodo(text) {
    this.dispatch('ADD_TODO', { text, id: nextTodoId++ });
  }

  toggleTodo(id) {
    this.dispatch('TOGGLE_TODO', id);
  }

  getTodos(state) {
    return this.slice(state);
  }

  @selector(service => [
    service.getTodos,
    VisibilityService.getVisibilityFilter
  ])
  getVisibleTodos(todos, currentFilter) {
    switch (currentFilter) {
      case 'SHOW_ALL':
        return todos;
      case 'SHOW_COMPLETED':
        return todos.filter(t => t.completed);
      case 'SHOW_ACTIVE':
        return todos.filter(t => !t.completed);
      default:
        throw new Error('Unknown filter: ' + currentFilter);
    }
  }
}

export default TodoService.get();
