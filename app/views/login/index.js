import React from 'react';
import {connect} from 'react-redux';
import classNaming from 'classnames';

import login from '../../modules/auth/actions/login';

import {CheckBox, ButtonBase, Input} from '../base';
import styles from './styles.css';

const LoginCheckBox = ({checked, onChange}) => {
  var checkboxClass = classNaming({
    checkboxChecked: checked,
    checkbox: true
  });

  return (
    <span className={checkboxClass} >
      <CheckBox onClick={onChange} checked={checked} label={'Keep me logged in'} name={'rememberMe'} />
    </span>
  );
}

const LoginPresenter = ({isError, rememberMe, email, password, handleInputChange, handleSubmit}) => {
  const inputStyles = {
    input: classNaming(styles.inputText, {[styles.inputError]: isError})
  };

  return (
    <div className={styles.page}>
      <div className={styles.logo}></div>
      <div className={styles.panel}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h4 className={styles.header}>LOGIN</h4>
          { isError && <span className={styles.errorMsg}>Bad login information </span>}
          <Input styles={inputStyles} value={email} placeholder="Email" onChange={handleInputChange('email')} required={true} type="text" />
          <Input styles={inputStyles} value={password} placeholder="Password" onChange={handleInputChange('password')} required={true} type="password" />
          <LoginCheckBox checked={rememberMe} onChange={handleInputChange('rememberMe')} />
          <a href="javascript:;" className={styles.forgot}>Forgot password?</a>
          <ButtonBase className={styles.submitBtn} type={'submit'}>LOGIN</ButtonBase>
        </form>
      </div>
    </div>
  );
}

const LoginContainer = React.createClass({
  getInitialState() {
    return { email: '', password: '', rememberMe: false };
  },
  handleInputChange(key) {
    return function(val) {
      var state = {};
      state[key] = val;
      this.setState(state);
    }.bind(this);
  },
  handleSubmit(event) {
    event.preventDefault();
    this.props.login(this.state.email, this.state.password);
  },
  render() {
    return (
      <LoginPresenter {...this.state} isError={this.props.isError} handleInputChange={this.handleInputChange} handleSubmit={this.handleSubmit} />
    );
  }
});

const mapStateToProps = (state) => {
  const {isFetching, isValid} = state.app.userLogged;
  return {
    isFetching: isFetching,
    isError: (!isFetching && !isValid)
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    login: function(email, pass) {
      dispatch(login(email, pass));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginContainer);
