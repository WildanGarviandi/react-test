import React from 'react';  // eslint-disable-line
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import { LoginAction } from '../modules/';
import store from '../store';
import config from '../config/configValues.json';
import Login from './components/Login';
import getLoginState from './Selector';

const mapStateToProps = (state) => {
  const stateProps = getLoginState(state);
  return stateProps;
};

const mapDispatchToProps = (dispatch) => {
  const dispatchData = bindActionCreators({
    login: LoginAction.login,
  }, dispatch);

  return dispatchData;
};

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

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
