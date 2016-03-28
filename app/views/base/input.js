import React from 'react';
import styles from './input.css';

const classnaming = require('classnames/bind').bind(styles);

const Input = React.createClass({
  handleChange(e) {
    let { onChange } = this.props;

    if(!onChange) return;
    onChange(e.target.value);
  },
  render() {
    let { className, errorMsg, placeholder, required, type, value } = this.props;
    let inputClass = classnaming(className, { hasError: errorMsg });

    return (
      <span style={{position: 'relative'}}>
        <input className={inputClass} placeholder={placeholder} type={type} value={value} onChange={this.handleChange} required={required} />
        <span className={styles.errorMsg}>{errorMsg}</span>
      </span>
    );
  }
});

function InputText(props) {
  return <Input {...props} type="text" />
}

function InputPassword(props) {
  return <Input {...props} type="password" />
}

export {InputText, InputPassword};
