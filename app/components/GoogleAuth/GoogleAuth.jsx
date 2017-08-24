import React, { PureComponent } from 'react';
import GoogleLogin from 'react-google-login';
import FontAwesome from 'react-fontawesome';

import PropTypes from 'prop-types';

import styles from './styles.scss';
import configValues from '../../config/configValues.json';

export default class GoogleAuth extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      clientId: configValues.GOOGLE_CLIENT_ID,
    };
    this.handleSuccessResponse = this.handleSuccessResponse.bind(this);
    this.handleFailureResponse = this.handleFailureResponse.bind(this);
  }

  handleSuccessResponse(response) {
    this.props.handleSuccessResponse(response);
  }

  handleFailureResponse(response) {
    this.props.handleFailureResponse(response);
  }

  render() {
    return (
      <div>
        <GoogleLogin
          className={styles['submit-btn']}
          clientId={this.state.clientId}
          onSuccess={this.handleSuccessResponse}
          onFailure={this.handleFailureResponse}
        >
          <div className={styles['google-container']}>
            <FontAwesome
              className={styles['google-container__plus']}
              size="lg"
              name="google-plus"
            />
          </div>
          <div className={styles['text-container']}>
            Sign In with Google
          </div>
        </GoogleLogin>
      </div>
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
  handleSuccessResponse: () => { },
  handleFailureResponse: () => { },
};
