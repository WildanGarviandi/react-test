import React, { PureComponent } from 'react';
import Sound from 'react-sound';
import NotificationSystem from 'react-notification-system';

import PropTypes from 'prop-types';

class Notification extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      style: {
        Containers: {
          DefaultStyle: {
            width: 500,
          },
          tr: {
            top: '40px',
          },
        },
        NotificationItem: {
          DefaultStyle: {
            fontSize: '14px',
            textAlign: 'center',
          },
        },
      },
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.notification.style) {
      const newStyle = newProps.notification.style;
      const notifItem = this.state.NotificationItem;
      notifItem.DefaultStyle = Object.assign(notifItem.DefaultStyle, newStyle);

      this.setState({
        notifItem,
      });
    }
  }

  render() {
    const { withSound, level } = this.props.notification;

    return (
      <span>
        <NotificationSystem ref="notificationSystem" style={style} />
        {withSound && level === 'error' &&
          <Sound url="/sound/system-fault.mp3" playStatus={Sound.status.PLAYING} />
        }
        {withSound && level === 'success' &&
          <Sound url="/sound/coins.mp3" playStatus={Sound.status.PLAYING} />
        }
        {withSound && level === 'info' &&
          <Sound url="/sound/job-done.mp3" playStatus={Sound.status.PLAYING} />
        }
        {withSound && level === 'warning' &&
          <Sound url="/sound/may-i-have-your-attention.mp3" playStatus={Sound.status.PLAYING} />
        }
      </span>
    );
  }
}

/* eslint-disable */
Notification.propTypes = {
  notification: PropTypes.any.isRequired,
};
/* eslint-enable */

Notification.defaultProps = {
  notification: {},
};

export default Notification;
