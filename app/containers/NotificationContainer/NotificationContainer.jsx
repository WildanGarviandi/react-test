import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import PropTypes from 'prop-types';

import { addNotification, removeNotification } from '../../modules/notification';
import Notification from '../../components/Notification';

const mapStateToProps = (state) => {
  const data = {
    notification: state.app.notification,
  };
  return data;
};

const mapDispatchToProps = (dispatch) => {
  const dispatchData = bindActionCreators({
    addNotification,
    removeNotification,
  }, dispatch);
  return dispatchData;
};

class NotificationContainer extends PureComponent {

  render() {
    return (
      <Notification
        notification={this.props.notification}
        removeNotification={this.props.removeNotification}
      />
    );
  }
}

/* eslint-disable */
NotificationContainer.propTypes = {
  notification: PropTypes.any,
  removeNotification: PropTypes.func,
};
/* eslint-enable */

NotificationContainer.defaultProps = {
  notification: {},
  removeNotification: () => { },
};

export default connect(mapStateToProps, mapDispatchToProps)(NotificationContainer);
