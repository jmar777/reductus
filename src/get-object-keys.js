export default obj => {
  let keys = Object.getOwnPropertyNames(obj);

  if (typeof Object.getOwnPropertySymbols === 'function') {
    keys = keys.concat(Object.getOwnPropertySymbols(obj));
  }

  return keys;
};
