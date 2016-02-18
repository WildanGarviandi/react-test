import React from 'react';

const CheckBox = React.createClass({
  handleClick(e) {
    let { onClick } = this.props;
    if(!onClick) return;
    onClick(e.target.checked);
  },
  render() {
    let { checked } = this.props;

    return (
      <input type="checkbox" checked={checked} onClick={this.handleClick} />
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
    let { className, placeholder, type, value } = this.props;

    return (
      <input className={className} placeholder={placeholder} type={type} value={value} onChange={this.handleChange} />
    );
  }
});

function InputText(props) {
  return <Input {...props} type="text" />
}

function InputPassword(props) {
  return <Input {...props} type="password" />
}

export { CheckBox, InputPassword, InputText };
