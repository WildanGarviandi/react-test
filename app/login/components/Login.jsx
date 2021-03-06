import React from 'react';

import PropTypes from 'prop-types';

import styles from '../styles.scss';
import LoginInput from './LoginInput';
import LoginCheckBox from './LoginCheckBox';
import { ButtonWithLoading } from '../../views/base';
import GoogleAuth from '../../components/GoogleAuth';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.handleSuccessResponse = this.handleSuccessResponse.bind(this);
    this.handleFailureResponse = this.handleFailureResponse.bind(this);
  }

  getEmailInputProps() {
    return {
      base: {
        value: this.props.input.email,
        placeholder: 'Email',
        required: true,
        type: 'text',
      },
      onChange: this.props.handleInputChange('email'),
      isError: this.props.loginState.isError,
    };
  }

  getPasswordInputProps() {
    return {
      base: {
        value: this.props.input.password,
        placeholder: 'Password',
        required: true,
        type: 'password',
      },
      onChange: this.props.handleInputChange('password'),
      isError: this.props.loginState.isError,
    };
  }

  getCheckboxInputProps() {
    return {
      checked: this.props.input.rememberMe,
      onChange: this.props.handleInputChange('rememberMe'),
      label: 'Keep me logged in',
      name: 'rememberMe',
    };
  }

  getSubmitBtnProps() {
    return {
      base: { type: 'submit' },
      isLoading: this.props.loginState.isFetching,
      styles: { base: styles.submitBtn, spinner: styles.submitBtnSpinner },
      textBase: 'LOGIN',
      textLoading: 'LOGGING IN',
    };
  }

  handleSuccessResponse(response) {
    this.props.handleGoogleAuth(response);
  }

  handleFailureResponse(response) {
    this.props.loginError(response.error);
  }

  render() {
    const emailInputProps = this.getEmailInputProps();
    const passwordInputProps = this.getPasswordInputProps();
    const checkboxInputProps = this.getCheckboxInputProps();
    const submitBtnProps = this.getSubmitBtnProps();

    return (
      <div className={styles.page}>
        <div className={styles.logo} />
        <div className={styles.panel}>
          <form className={styles.form} onSubmit={this.props.handleSubmit}>
            <div>
              <h4 className={styles.header}>LOGIN</h4>
              {this.props.loginState.isError &&
                <span className={styles.errorMsg}>{this.props.loginState.message}</span>}
              <LoginInput {...emailInputProps} />
              <LoginInput {...passwordInputProps} />
              <LoginCheckBox {...checkboxInputProps} />
              <a href="" className={styles.forgot}>Forgot password?</a>
              <ButtonWithLoading {...submitBtnProps} />
              <br />
              <GoogleAuth
                handleSuccessResponse={this.handleSuccessResponse}
                handleFailureResponse={this.handleFailureResponse}
              />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

/* eslint-disable */
Login.propTypes = {
  input: PropTypes.any,
  handleInputChange: PropTypes.any,
  handleSubmit: PropTypes.any,
  loginState: PropTypes.any,
  handleGoogleAuth: PropTypes.func,
  loginError: PropTypes.func,
};
/* eslint-enable */

Login.defaultProps = {
  input: null,
  handleInputChange: null,
  handleSubmit: null,
  loginState: null,
  handleGoogleAuth: () => { },
  loginError: () => { },
};
