import React, { PureComponent } from 'react';
import GoogleLogin from 'react-google-login';

import PropTypes from 'prop-types';
import configValues from '../../config/configValues.json';

export default class GoogleAuth extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      clientId: configValues.GOOGLE_CLIENT_ID,
    };
  }

  handleSuccessResponse(response) {
    this.props.handleSuccessResponse(response);
  }

  handleFailureResponse(response) {
    this.props.handleFailureResponse(response);
  }

  render() {
    return (
      <GoogleLogin
        clientId={this.state.clientId}
        buttonText="Login"
        onSuccess={this.handleSuccessResponse}
        onFailure={this.handleFailureResponse}
      />
    );
  }
}

/* eslint-disable */
GoogleAuth.propTypes = {
  handleSuccessResponse: PropTypes.func,
  handleFailureResponse: PropTypes.func,
};
/* eslint-enable */

GoogleAuth.defaultProps = {
  handleSuccessResponse: () => {},
  handleFailureResponse: () => {},
};
