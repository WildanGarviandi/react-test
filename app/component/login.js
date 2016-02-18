import React from 'react';
import { CheckBox, InputPassword, InputText } from './utils';
import styles from '../styles/login.css';

var classNames = require('classnames/bind').bind(styles);

const LoginPanel = React.createClass({
  render() {
    return (
      <div className={styles.panel} >
        <div className={styles.form} >
          <LoginForm />
        </div>
      </div>
    );
  }
});

const LoginCheckBox = React.createClass({
  render() {
    let { checked, onChange } = this.props;

    var checkboxClass = classNames({
      checkboxChecked: checked,
      checkbox: true
    });

    return (
      <span className={checkboxClass} >
        <CheckBox onClick={onChange} checked={checked} />
        <label>Keep me logged in</label>
      </span>
    );
  }
});

const LoginForm = React.createClass({
  getInitialState() {
    return { email: '', password: '', checked: false };
  },
  handleChange(key) {
    return function (s) {
      var state = {};
      state[key] = s;
      this.setState(state);
    }.bind(this);
  },
  render() {
    let { checked, email, password } = this.state;
    let { handleChange } = this;

    return (
      <form>
        <h4 className={styles.header}>LOGIN</h4>
        <InputText className={styles.inputText} value={email} placeholder="Email" onChange={handleChange('email')} />
        <InputPassword className={styles.inputText} value={password} placeholder="Password" onChange={handleChange('password')} />
        <LoginCheckBox checked={checked} onChange={handleChange('checked')} />
        <a href="javascript:;" className={styles.forgot}>Forgot password?</a>
        <button className={styles.submitBtn}>LOGIN</button>
      </form>
    );
  }
});

export { LoginPanel };
