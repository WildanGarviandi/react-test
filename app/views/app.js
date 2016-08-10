import React from 'react';
import {connect} from 'react-redux';
import {BackDrop} from './base/modal';
import {ModalMessage} from './base';

const App = React.createClass({
  render() {
    const {haveModal, showBackdrop} = this.props;

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
      </div>
    );
  }
});

function StateToProps(state) {
  const {modals, showBackdrop} = state.app.modals;

  return {
    haveModal: modals.length > 0,
    showBackdrop,
  }
}

export default connect(StateToProps)(App);
