import React from 'react';

const CheckBox = React.createClass({
  handleClick(e) {
    let { onChange } = this.props;
    if(!onChange) return;
    onChange(e.target.checked);
  },
  render() {
    let { checked, label, name, styles = {} } = this.props;

    return (
      <span className={styles.container}>
        <input type="checkbox" checked={checked} onChange={this.handleClick} id={name} className={styles.checkbox} />
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
  handleEnterKey(e) {
    if(e.keyCode === 13 && this.props.onEnterKeyPressed) {
      this.props.onEnterKeyPressed(e.target.value);
    }
  },
  render() {
    let { base, notes, styles = {} } = this.props;

    return (
      <span className={styles.container}>
        <input {...base} className={styles.input} onChange={this.handleChange} onKeyDown={this.handleEnterKey} />
        <span className={styles.notes}>{notes}</span>
      </span>
    );
  }
});

const InputWithState = React.createClass({
  getInitialState() {
    return {currentText: ""};
  },
  setText(val) {
    this.setState({currentText: val});
  },
  handleSelect() {
    this.props.handleSelect(this.state.currentText);
  },
  render() {
    return <Input {...this.props} onChange={this.setText} onEnterKeyPressed={this.handleSelect} />
  }
})

const InputWithDefault = React.createClass({
  getInitialState() {
    return {currentText: this.props.currentText || ""};
  },
  setText(val) {
    this.setState({currentText: val});
    if(this.props.onChange) {
      this.props.onChange(val);
    }
  },
  handleSelect() {
    this.props.handleSelect(this.state.currentText);
  },
  render() {
    return <Input {...this.props} base={{value: this.state.currentText, type: this.props.type}} onChange={this.setText} onEnterKeyPressed={this.handleSelect} />
  }
});

export {CheckBox, Input, InputWithDefault, InputWithState};
