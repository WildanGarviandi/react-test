import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import ProfileMenu from '../../components/ProfileMenu';

const mapStateToProps = (state) => {
  const { userLogged } = state.app;
  const data = {
    userLogged,
  };
  return data;
};

class ProfileMenuContainer extends PureComponent {
  render() {
    return (
      <ProfileMenu
        userLogged={this.props.userLogged}
      />
    );
  }
}

/* eslint-disable */
ProfileMenuContainer.propTypes = {
  userLogged: PropTypes.any,
};
/* eslint-enable */

ProfileMenuContainer.defaultProps = {
  userLogged: {},
};

export default connect(mapStateToProps, null)(ProfileMenuContainer);
