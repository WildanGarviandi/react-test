import React, { PureComponent } from 'react';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import styles from './styles.scss';
import DayContent from './DayContent';
import TimeContent from './TimeContent';
import configValues from '../../../config/configValues.json';
import {
  fetchWorkingTime,
  resetWorkingTime
} from '../../../modules/driverWorkingTime';

const mapDispatchToProps = dispatch => {
  const dispatchData = bindActionCreators(
    {
      fetchWorkingTime,
      resetWorkingTime
    },
    dispatch
  );

  return dispatchData;
};

class DriverWorkHourModal extends PureComponent {
  constructor(props) {
    super(props);
    this.props.resetWorkingTime();
    this.props.fetchWorkingTime();
  }

  render() {
    const { profilePicture, driver } = this.props;

    return (
      <ModalContainer>
        <ModalDialog>
          <div className={styles.modalTitle}>
            Set Driver&apos;s Availability
          </div>
          <div className={styles.modalBody}>
            <DayContent profilePicture={profilePicture} driver={driver} />
            <TimeContent />
          </div>
        </ModalDialog>
      </ModalContainer>
    );
  }
}

/* eslint-disable */
DriverWorkHourModal.propTypes = {
  profilePicture: PropTypes.string,
  driver: PropTypes.object,
  fetchWorkingTime: PropTypes.func.isRequired,
  resetWorkingTime: PropTypes.func.isRequired
};
/* eslint-enable */

DriverWorkHourModal.defaultProps = {
  profilePicture: configValues.IMAGES.DEFAULT_PROFILE,
  driver: {}
};

export default connect(null, mapDispatchToProps)(DriverWorkHourModal);
