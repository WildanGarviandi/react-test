import React from 'react';
import classNaming from 'classnames';
import styles from '../../components/form.scss';
import NumberFormat from 'react-number-format';

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

    var classes = classNaming(
      this.props.className,
      styles.checkbox
    );

    return (
      <span className={styles.container}>
        <input type="checkbox" checked={this.state.checked} onChange={this.handleClick} id={name} className={classes} onKeyDown={this.handleEnterKey} />
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
    let { base, notes, id, styles = {}, placeholder } = this.props;

    var classes = classNaming(
      this.props.className,
      styles.input
    );

    return (
      <span className={styles.container}>
        <input {...base} className={classes} onChange={this.handleChange} onKeyDown={this.handleEnterKey} 
          id={id} ref={id} />
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
    const base = {
      value: this.state.currentText,
      type: this.props.type,
      autoFocus: this.props.autoFocus,
      placeholder: this.props.placeholder
    }
    return <Input {...this.props} base={base} onChange={this.setText} onEnterKeyPressed={this.handleSelect} />
  }
});

const InputWithDefaultNumberFormatted = React.createClass({
  getInitialState () {
    return {
      currentText: this.props.currentText || ''
    }
  },
  setText (e, value) {
    this.setState({currentText: parseFloat(value) || '0'})
    if (this.props.onChange) {
      this.props.onChange(value)
    }
  },
  handleEnterKey (e) {
    if (e.keyCode === 13 && this.props.handleEnter) {
      this.props.handleEnter(this.props.currentText);
    }
  },
  render () {
    const {id} = this.props
    const classes = classNaming(
      this.props.className,
      styles.input
    )
    return <NumberFormat {...this.props.format} onChange={this.setText} onKeyDown={this.handleEnterKey} className={classes} id={id} value={this.state.currentText} />
  }
})

export {CheckBox, Input, InputWithDefault, InputWithState, InputWithDefaultNumberFormatted};
