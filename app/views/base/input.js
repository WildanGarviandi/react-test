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
    let { base, notes, styles } = this.props;

    return (
      <span className={styles.container}>
        <input {...base} className={styles.input} onChange={this.handleChange} />
        <span className={styles.notes}>{notes}</span>
      </span>
    );
  }
});

export {CheckBox, Input};
