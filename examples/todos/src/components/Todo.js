import React from 'react';

const Todo = ({ onClick, completed, text }) => {
  const styles = { textDecoration: completed ? 'line-through' : 'none' };

  return <li onClick={onClick} style={styles}>{text}</li>;
};

export default Todo;
