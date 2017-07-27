import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import ProfileMenu from '../../components/ProfileMenu';
import getCurrentState from './Selector';

const mapStateToProps = (state) => {
  const stateToProps = getCurrentState(state);
  return stateToProps;
};

class ProfileMenuContainer extends PureComponent {
  render() {
    return (
      <ProfileMenu
        token={this.props.token}
        hubs={this.props.hubs}
        hubID={this.props.hubID}
      />
    );
  }
}

/* eslint-disable */
ProfileMenuContainer.propTypes = {
  token: PropTypes.string.isRequired,
  hubs: PropTypes.array.isRequired,
  hubID: PropTypes.number.isRequired,
};
/* eslint-enable */

export default connect(mapStateToProps, null)(ProfileMenuContainer);
