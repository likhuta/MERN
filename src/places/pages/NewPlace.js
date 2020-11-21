import React from 'react';

import Input from '../../shared/components/FormElements/Input';
import './NewPlace.css'

const NewPlace = (props) => {
  return (
    <form className="place-form">
      <Input type="text" label="Title" element="input" />
    </form>
  )
};

export default NewPlace;