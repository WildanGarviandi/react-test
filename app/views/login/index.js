import React from 'react';  // eslint-disable-line
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { LoginAction } from '../../modules/';
import store from '../../store';
import config from '../../config/configValues.json';
import Login from './Login';

class LoginPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = { email: '', password: '', rememberMe: false };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    if (this.props.token) {
      if (this.props.hubID) {
        store.dispatch(push(config.defaultMainPageTMS));
      } else {
        store.dispatch(push(config.defaultMainPage));
      }
    }
  }

  handleInputChange(key) {
    return (val) => {
      this.setState({ [key]: val });
    };
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.login(this.state.email, this.state.password);
  }

  render() {
    const { loginState } = this.props;

    return (
      <Login
        input={this.state}
        handleInputChange={this.handleInputChange}
        handleSubmit={this.handleSubmit} loginState={loginState}
      />
    );
  }
}

/* eslint-disable */
LoginPage.propTypes = {
  token: PropTypes.string,
  hubID: PropTypes.any,
  login: PropTypes.any,
  loginState: PropTypes.any,
};
/* eslint-enable */

LoginPage.defaultProps = {
  token: '',
  hubID: null,
  login: null,
  loginState: null,
};

const mapStateToProps = (state) => {
  const { isFetching, isValid, message, token } = state.app.userLogged;

  return {
    loginState: {
      isFetching,
      isError: (!isFetching && !isValid),
      message,
    },
    token,
  };
};

const mapDispatchToProps = (dispatch) => {
  const dispatchData = {
    login: (email, pass) => {
      dispatch(LoginAction.login(email, pass));
    },
  };

  return dispatchData;
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
