import { connect } from 'react-redux';
import TodoService from '../services/TodoService';
import TodoList from '../components/TodoList';

const mapStateToProps = state => ({
  todos: TodoService.getVisibleTodos(state),
  onTodoClick: TodoService.toggleTodo
});

const VisibleTodoList = connect(mapStateToProps)(TodoList);

export default VisibleTodoList;
