import React from 'react';
import {connect} from 'react-redux';

import {ModalMessage} from './base';

const App = React.createClass({
  render() {
    const {haveModal} = this.props;

    return (
      <div style={{height: "100%", overflow: (haveModal && 'hidden')}}>
        {this.props.children}
        {
          haveModal &&
          <ModalMessage />
        }
      </div>
    );
  }
});

function StateToProps(state) {
  const {modals} = state.app.modals;

  return {
    haveModal: modals.length > 0,
  }
}

export default connect(StateToProps)(App);