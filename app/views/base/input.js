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
  handleEnterKey(e) {
    if(e.keyCode === 13 && this.props.onEnterKeyPressed) {
      this.props.onEnterKeyPressed(e.target.value);
    }
  },
  render() {
    let { base, notes, styles = {} } = this.props;

    return (
      <span className={styles.container}>
        <input {...base} className={styles.input} onChange={this.handleChange} onKeyDown={this.handleEnterKey} value={3} />
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

export {CheckBox, Input, InputWithState};
