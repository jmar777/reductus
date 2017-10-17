import React from 'react';
import { connect } from 'react-redux';
import TodoService from '../services/TodoService';

const AddTodo = () => {
  let input;

  let onSubmit = e => {
    e.preventDefault();

    if (!input.value.trim()) {
      return;
    }

    TodoService.addTodo(input.value);

    input.value = '';
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input ref={node => { input = node; }} />
        <button type='submit'>Add Todo</button>
      </form>
    </div>
  );
}

export default connect()(AddTodo);
