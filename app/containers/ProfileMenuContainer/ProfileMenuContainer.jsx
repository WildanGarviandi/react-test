import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import PropTypes from 'prop-types';

import ProfileMenu from '../../components/ProfileMenu';
import getCurrentState from './Selector';
import { ChooseHubAction } from '../../modules';

const mapStateToProps = (state) => {
  const stateToProps = getCurrentState(state);
  return stateToProps;
};

const mapDispatchToProps = (dispatch) => {
  const dispatchData = bindActionCreators({
    chooseHub: ChooseHubAction.chooseHub,
  }, dispatch);

  return dispatchData;
};

class ProfileMenuContainer extends PureComponent {
  render() {
    const renderData = this.props.hubID && this.props.hubs.length > 0 ? (
      <ProfileMenu
        token={this.props.token}
        hubs={this.props.hubs}
        hubID={this.props.hubID}
        chooseHub={this.props.chooseHub}
      />
    ) : (<span />);

    return renderData;
  }
}

/* eslint-disable */
ProfileMenuContainer.propTypes = {
  token: PropTypes.string.isRequired,
  hubs: PropTypes.array.isRequired,
  hubID: PropTypes.number,
  chooseHub: PropTypes.func.isRequired,
};
/* eslint-enable */

ProfileMenuContainer.defaultProps = {
  hubID: null,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileMenuContainer);
