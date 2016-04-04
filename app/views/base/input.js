import React from 'react';

const CheckBox = React.createClass({
  handleClick(e) {
    let { onChange } = this.props;
    if(!onChange) return;
    onChange(e.target.checked);
  },
  render() {
    let { checked, label, name, styles } = this.props;

    return (
      <span className={styles.container}>
        <input type="checkbox" checked={checked} onClick={this.handleClick} id={name} className={styles.checkbox} />
        <label htmlFor={name} className={styles.label}>{label}</label>
      </span>
    );
  }
});

const Input = React.createClass({
  handleChange(e) {
    let { onChange } = this.props;

    if(!onChange) return;
    onChange(e.target.value);
  },
  render() {
    let { notes, placeholder, required, styles, type, value } = this.props;

    return (
      <span className={styles.container}>
        <input className={styles.input} placeholder={placeholder} type={type} value={value} onChange={this.handleChange} required={required} />
        <span className={styles.notes}>{notes}</span>
      </span>
    );
  }
});

export {CheckBox, Input};
