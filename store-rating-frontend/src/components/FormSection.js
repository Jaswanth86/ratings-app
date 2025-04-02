import React from 'react';

function FormSection({ title, fields, values, onChange, onSubmit, buttonText }) {
  return (
    <div className="form-section">
      <h3>{title}</h3>
      <form onSubmit={onSubmit}>
        {fields.map(field => (
          field.type === 'select' ? (
            <select
              key={field.name}
              name={field.name}
              value={values[field.name]}
              onChange={onChange}
            >
              {field.options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ) : (
            <input
              key={field.name}
              type={field.type || 'text'}
              name={field.name}
              value={values[field.name]}
              onChange={onChange}
              placeholder={field.placeholder}
            />
          )
        ))}
        <button type="submit" className="action-btn">{buttonText}</button>
      </form>
    </div>
  );
}

export default FormSection;