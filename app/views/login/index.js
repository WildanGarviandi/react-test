import React from 'react';
import {connect} from 'react-redux';
import classNaming from 'classnames';

import {LoginAction} from '../../modules/';
import {CheckBox, ButtonBase, Input} from '../base';
import styles from './styles.css';

const LoginCheckBox = (props) => {
  var checkboxStyle = {
    container: classNaming(styles.checkbox, {[styles.checked]: props.checked}),
    checkbox: styles.checkboxInput,
    label: styles.checkboxLabel
  }

  return (
    <CheckBox styles={checkboxStyle} {...props} />
  );
}

const LoginInput = (props) => {
  var inputStyles = {
    container: styles.inputWrapper,
    input: classNaming(styles.inputText, {[styles.inputError]: props.isError}),
    notes: styles.inputNotes
  }

  return (
    <Input {...props} styles={inputStyles} />
  );
}

const Login = ({input, handleInputChange, handleSubmit, loginState}) => {
  const emailInputProps = {
    value: input.email,
    placeholder:"Email",
    onChange: handleInputChange('email'),
    required: true,
    type: "text",
    isError: loginState.isError
  }

  const passwordInputProps = {
    value: input.password,
    placeholder:"Password",
    onChange: handleInputChange('password'),
    required: true,
    type: "password",
    isError: loginState.isError
  }

  const checkboxInputProps = {
    checked: input.rememberMe,
    onChange: handleInputChange('rememberMe'),
    label : 'Keep me logged in',
    name :'rememberMe'
  }

  const submitBtnDisabled = {
    disabled: true,
    styles: classNaming(styles.submitBtn, styles.submitBtnDisabled)
  }

  return (
    <div className={styles.page}>
      <div className={styles.logo}></div>
      <div className={styles.panel}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h4 className={styles.header}>LOGIN</h4>
          { loginState.isError && <span className={styles.errorMsg}>{loginState.message}</span> }
          <LoginInput {...emailInputProps} />
          <LoginInput {...passwordInputProps} />
          <LoginCheckBox {...checkboxInputProps} />
          <a href="javascript:;" className={styles.forgot}>Forgot password?</a>
          {
            loginState.isFetching ?
            <ButtonBase {...submitBtnDisabled}>
              <span className={styles.loading}>LOGGING IN</span>
            </ButtonBase> :
            <ButtonBase styles={styles.submitBtn} type={'submit'}>LOGIN</ButtonBase>
          }
        </form>
      </div>
    </div>
  );
}

const LoginPage = React.createClass({
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
    const {loginState} = this.props;

    return (
      <Login input={this.state} handleInputChange={this.handleInputChange} handleSubmit={this.handleSubmit} loginState={loginState} />
    );
  }
});

const mapStateToProps = (state) => {
  const {isFetching, isValid, message} = state.app.userLogged;

  return {
    loginState: {
      isFetching: isFetching,
      isError: (!isFetching && !isValid),
      message: message
    }
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    login: function(email, pass) {
      dispatch(LoginAction.login(email, pass));
    }
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(LoginPage);
