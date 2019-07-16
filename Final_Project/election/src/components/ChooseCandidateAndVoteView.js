import React from 'react';
import Select from 'react-select';

const ChooseCandidateAndVoteView = ({ options, selectedOption, handleChange }) => {

  const isLoading = false;

  return <
  Select value={selectedOption} onChange={handleChange} options={options}
  />
}

export default ChooseCandidateAndVoteView
