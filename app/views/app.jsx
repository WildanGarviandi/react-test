import React from 'react';
import { connect } from 'react-redux';

import { BackDrop } from './base/modal';
import { ModalMessage } from './base';
import NotificationContainer from '../containers/NotificationContainer/NotificationContainer';

const App = React.createClass({
  render() {
    const { haveModal, showBackdrop } = this.props;
    const isBackDrop = true;

    return (
      <div style={{ height: '100%', overflow: (haveModal && 'hidden') }}>
        {this.props.children}
        {
          haveModal &&
          <ModalMessage />
        }
        {
          showBackdrop &&
          <BackDrop show={isBackDrop} />
        }
        <NotificationContainer />
      </div>
    );
  },
});

function StateToProps(state) {
  const { userLogged } = state.app;
  const { modals, showBackdrop } = state.app.modals;

  return {
    haveModal: modals.length > 0,
    showBackdrop,
    userLogged,
  };
}

export default connect(StateToProps)(App);
