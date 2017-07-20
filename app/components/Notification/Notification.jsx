import React, { PureComponent } from 'react';
import Sound from 'react-sound';
import NotificationSystem from 'react-notification-system';

import PropTypes from 'prop-types';
import * as _ from 'lodash';

import configValues from '../../config/configValues.json';

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
      soundMapUrl: {
        error: configValues.SOUND.SYSTEM_FAULT,
        success: configValues.SOUND.COINS,
        info: configValues.SOUND.JOB_DONE,
        warning: configValues.SOUND.MAY_I_HAVE_YOUR_ATTENTION,
      },
    };
  }

  componentWillReceiveProps(newProps) {
    const { message, level, position, timeout, style } = newProps.notification;
    if (style) {
      const notifItem = this.state.NotificationItem;
      notifItem.DefaultStyle = Object.assign(notifItem.DefaultStyle, style);

      this.setState({
        notifItem,
      });
    }
    if (message) {
      this.notificationSystem.addNotification({
        message,
        level: level || 'info',
        position: position || 'tr',
        autoDismiss: timeout || 2,
        onRemove: () => {
          this.props.removeNotification();
        },
      });
    }
  }

  render() {
    const { withSound, level } = this.props.notification;
    const soundUrl = _.get(this.state.soundMapUrl, level);

    return (
      <span>
        <NotificationSystem
          ref={(ns) => { this.notificationSystem = ns; }}
          style={this.state.style}
        />
        {withSound && <Sound url={soundUrl} playStatus={Sound.status.PLAYING} />}
      </span>
    );
  }
}

/* eslint-disable */
Notification.propTypes = {
  notification: PropTypes.any,
  removeNotification: PropTypes.func,
};
/* eslint-enable */

Notification.defaultProps = {
  notification: {},
  removeNotification: () => {},
};

export default Notification;
