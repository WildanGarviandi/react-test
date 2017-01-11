import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addNotification } from '../../modules/notification/actions';
import NotificationSystem from 'react-notification-system';
import NotifActions from '../../modules/notification/actions';
import Sound from 'react-sound';

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

function createNotification (component, message, level, position, timeout) {
  if (message) {
    component.notificationSystem.addNotification({
      message,
      level: level || 'info',
      position: position || 'tr',
      autoDismiss: timeout || 2,
      onRemove: function () {
        component.props.removeNotification();
      }
    });
  }
}
 
class NotificationContainer extends Component {
 
  constructor(props) {
    super(props);
  }
 
  componentDidMount() {
    this.notificationSystem = this.refs.notificationSystem;
    const { message, level, position, timeout } = this.props.notification;
    createNotification (this, message, level, position, timeout);
  }

  componentWillReceiveProps(newProps) {
    const { message, level, position, timeout } = newProps.notification;
    createNotification (this, message, level, position, timeout);
  }
 
  render() {
    const { withSound, level } = this.props.notification;
    return (
      <span>
        <NotificationSystem ref="notificationSystem" style={style} />
        { withSound && level === 'error' &&
          <Sound url="/sound/system-fault.mp3" playStatus={Sound.status.PLAYING} />
        }
        { withSound && level === 'success' &&
          <Sound url="/sound/coins.mp3" playStatus={Sound.status.PLAYING} />
        }
        { withSound && level === 'info' &&
          <Sound url="/sound/job-done.mp3" playStatus={Sound.status.PLAYING} />
        }
        { withSound && level === 'warning' &&
          <Sound url="/sound/may-i-have-your-attention.mp3" playStatus={Sound.status.PLAYING} />
        }
      </span>
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
    actions: bindActionCreators({ addNotification }, dispatch),
    removeNotification: () => {
      dispatch(NotifActions.removeNotification());
    }
  };
}
 
export default connect(mapStateToProps, mapDispatchToProps)(NotificationContainer);