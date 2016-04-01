import React from 'react';

const Input = React.createClass({
  handleChange(e) {
    let { onChange } = this.props;

    if(!onChange) return;
    onChange(e.target.value);
  },
  render() {
    let { errorMsg, placeholder, required, styles, type, value } = this.props;

    return (
      <span style={{position: 'relative'}}>
        <input className={styles.input} placeholder={placeholder} type={type} value={value} onChange={this.handleChange} required={required} />
        <span className={styles.error}>{errorMsg}</span>
      </span>
    );
  }
});

export {Input};
