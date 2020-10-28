import React from 'react';

function ListErrors(props) {
  const errors = props.errors; 
  return (
    errors?
      <ul className="error-messages">
        {
          Object.keys(errors).map(key => {
            return (
              <li key={key}>
                {key} {errors[key]}
              </li>
            );
          })
        }
      </ul>
    :
      null
  )
}

export default ListErrors;
