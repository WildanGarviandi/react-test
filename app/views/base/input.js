import React from 'react';

const CheckBox = React.createClass({
  getInitialState() {
    return {checked: this.props.checked || false};
  },
  componentWillReceiveProps(nextProps) {
    if(nextProps.checked !== this.props.checked) {
      this.setState({checked: nextProps.checked});
    }
  },
  handleClick(e) {
    let { onChange } = this.props;
    if(!onChange) return;
    onChange(e.target.checked);
    this.setState({checked: !this.state.checked});
  },
  handleEnterKey(e) {
    if(e.keyCode === 13 && this.props.onEnterKeyPressed) {
      this.props.onEnterKeyPressed();
    }
  },
  render() {
    let { checked, label, name, styles = {} } = this.props;

    return (
      <span className={styles.container}>
        <input type="checkbox" checked={this.state.checked} onChange={this.handleClick} id={name} className={styles.checkbox} onKeyDown={this.handleEnterKey} />
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
  componentWillReceiveProps(nextProps) {
    if(this.props.currentText !== nextProps.currentText) {
      this.setState({currentText: nextProps.currentText});
    }
  },
  setText(val) {
    this.setState({currentText: val});
    if(this.props.onChange) {
      this.props.onChange(val);
    }
  },
  handleSelect() {
    this.props.handleSelect(this.state.currentText);
    this.props.handleEnter();
  },
  render() {
    return <Input {...this.props} base={{value: this.state.currentText, type: this.props.type, autoFocus: this.props.autoFocus}} onChange={this.setText} onEnterKeyPressed={this.handleSelect} />
  }
});

export {CheckBox, Input, InputWithDefault, InputWithState};
