import React from 'react';
import Select from 'react-select';

const ListView = ({ options, selectedOption, handleChange }) => {

  return <
  Select value={selectedOption} onChange={handleChange} options={options}
  />
}

export default ListView
