import React from 'react';
import {connect} from 'react-redux';
import classNaming from 'classnames';

import {LoginAction} from '../../modules/';
import {ButtonWithLoading, CheckBox, Input} from '../base';
import styles from './styles.css';
import store from '../../store';
import {push} from 'react-router-redux';
import config from '../../config/configValues.json'

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
    <Input {...props} styles={inputStyles} className={inputStyles.input} />
  );
}

const Login = ({input, handleInputChange, handleSubmit, loginState}) => {
  const emailInputProps = {
    base: {
      value: input.email,
      placeholder:"Email",
      required: true,
      type: "text"
    },
    onChange: handleInputChange('email'),
    isError: loginState.isError
  }

  const passwordInputProps = {
    base: {
      value: input.password,
      placeholder:"Password",
      required: true,
      type: "password"
    },
    onChange: handleInputChange('password'),
    isError: loginState.isError
  }

  const checkboxInputProps = {
    checked: input.rememberMe,
    onChange: handleInputChange('rememberMe'),
    label : 'Keep me logged in',
    name :'rememberMe'
  }

  const submitBtnProps = {
    base: {type: 'submit'},
    isLoading: loginState.isFetching,
    styles: {base: styles.submitBtn, spinner: styles.submitBtnSpinner},
    textBase: 'LOGIN',
    textLoading: 'LOGGING IN'
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
          <ButtonWithLoading {...submitBtnProps} />
        </form>
      </div>
    </div>
  );
}

const LoginPage = React.createClass({
  getInitialState() {
    return { email: 'fleet@etobee.com', password: '123456', rememberMe: false };
  },
  handleInputChange(key) {
    return (val) => {
      this.setState({[key]: val});
    };
  },
  handleSubmit(event) {
    event.preventDefault();
    this.props.login(this.state.email, this.state.password);
  },
  componentWillMount() {
    if (this.props.token) {
      if (this.props.hubID) {
        store.dispatch(push(config.defaultMainPageTMS));
      } else {
        store.dispatch(push(config.defaultMainPage));
      }
    }
  },
  render() {
    const {loginState} = this.props;

    return (
      <Login input={this.state} handleInputChange={this.handleInputChange} handleSubmit={this.handleSubmit} loginState={loginState} />
    );
  }
});

const mapStateToProps = (state) => {
  const {isFetching, isValid, message, token} = state.app.userLogged;

  return {
    loginState: {
      isFetching: isFetching,
      isError: (!isFetching && !isValid),
      message: message
    },
    token
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
