import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addNotification } from '../../modules/notification/actions';
import NotificationSystem from 'react-notification-system';

/**
 * Overriding style
 * Ref: https://github.com/igorprado/react-notification-system/blob/master/src/styles.js
 */
let style = {
  Containers: {
    DefaultStyle: {
      width: 500
    },
    tr: {
      top: '40px'
    }
  },
  NotificationItem: {
    DefaultStyle: {
      fontSize: '14px',
      textAlign: 'center'
    }
  }
};

function createNotification (component, message, level, position) {
  if (message) {
    component.notificationSystem.addNotification({
      message,
      level: level || 'info',
      position: position || 'tr',
      autoDismiss: 2,
    });
  }
}
 
class NotificationContainer extends Component {
 
  constructor(props) {
    super(props);
  }
 
  componentDidMount() {
    this.notificationSystem = this.refs.notificationSystem;
    const { message, level, position } = this.props.notification;
    createNotification (this, message, level, position);
  }

  componentWillReceiveProps(newProps) {
    const { message, level, position } = newProps.notification;
    createNotification (this, message, level, position);
  }
 
  render() {
    return (
      <NotificationSystem ref="notificationSystem" style={style} />
    );
  }
}
 
function mapStateToProps(state) {
  return {
    notification: state.app.notification
  };
}
 
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      addNotification
    }, dispatch)
  };
}
 
export default connect(mapStateToProps, mapDispatchToProps)(NotificationContainer);