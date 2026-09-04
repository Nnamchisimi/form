import React from 'react';

const FormHeader = ({ title, description }) => (
  <div className="form-header">
    <h1>{title}</h1>
    <p>{description}</p>
  </div>
);

export default FormHeader;
