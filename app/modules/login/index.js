import React from 'react';
import {Link} from 'react-router';
import {InputText, InputPassword, CheckBox, ButtonBase} from '../base';
import styles from './styles.css';

var classNaming = require('classnames/bind').bind(styles);

const LoginCheckBox = ({checked, onChange}) => {
  var checkboxClass = classNaming({
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

const LoginPresenter = ({rememberMe, email, password, handleInputChange}) => {
  return (
    <div className={styles.page}>
      <div className={styles.logo}></div>
      <div className={styles.panel}>
        <form className={styles.form}>
          <h4 className={styles.header}>LOGIN</h4>
          <InputText className={styles.inputText} value={email} placeholder="Email" onChange={handleInputChange('email')} />
          <InputPassword className={styles.inputText} value={password} placeholder="Password" onChange={handleInputChange('password')} />
          <LoginCheckBox checked={rememberMe} onChange={handleInputChange('rememberMe')} />
          <a href="javascript:;" className={styles.forgot}>Forgot password?</a>
          <ButtonBase className={styles.submitBtn}>
            <Link to={'/myOrder'}>LOGIN</Link>
          </ButtonBase>
        </form>
      </div>
    </div>
  );
}

const LoginContainer = React.createClass({
  getInitialState() {
    return { name: '', password: '', rememberMe: false };
  },
  handleInputChange(key) {
    return function(val) {
      var state = {};
      state[key] = val;
      this.setState(state);
    }.bind(this);
  },
  render() {
    return (
      <LoginPresenter {...this.state} handleInputChange={this.handleInputChange} />
    );
  }
});

export default LoginContainer;
