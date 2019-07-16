import React from 'react';
import Select from 'react-select';

const AccountsSelectionView = ({ options, selectedOption, handleChange }) => {

  return <
  Select value={selectedOption} onChange={handleChange} options={options}
  />
}

export default AccountsSelectionView
