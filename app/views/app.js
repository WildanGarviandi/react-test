import React from 'react';
import {connect} from 'react-redux';
import {BackDrop} from './base/modal';
import {ModalMessage, NotificationContainer} from './base';

const App = React.createClass({
  render() {
    const {haveModal, showBackdrop, haveNotif} = this.props;

    return (
      <div style={{height: "100%", overflow: (haveModal && 'hidden')}}>
        {this.props.children}
        {
          haveModal &&
          <ModalMessage />
        }
        {
          showBackdrop &&
          <BackDrop show={true} />
        }
        {
          haveNotif &&
          <NotificationContainer />
        }
      </div>
    );
  }
});

function StateToProps(state) {
  const { notification } = state.app;
  const { modals, showBackdrop } = state.app.modals;

  return {
    haveModal: modals.length > 0,
    showBackdrop,
    haveNotif: (notification && notification.message)
  }
}

export default connect(StateToProps)(App);
