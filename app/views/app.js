import React from 'react';
import {connect} from 'react-redux';

import {AppLoadedActions} from '../modules';

import {ModalMessage} from './base';

const App = React.createClass({
  componentWillMount() {
    this.props.districtsFetch();
    this.props.driversFetch();
  },
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

function DispatchToProps(dispatch) {
  return {
    districtsFetch() {
      dispatch(AppLoadedActions.districtsFetch());
    },
    driversFetch() {
      dispatch(AppLoadedActions.driversFetch());
    },
  }
}

export default connect(StateToProps, DispatchToProps)(App);
