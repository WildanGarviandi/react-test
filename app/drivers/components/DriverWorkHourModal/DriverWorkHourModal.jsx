import React, { PureComponent } from 'react';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';
import { connect } from 'react-redux';

import * as _ from 'lodash';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import styles from './styles.scss';
import DayContent from './DayContent';
import TimeContent from './TimeContent';
import configValues from '../../../config/configValues.json';
import { getTimeFormat } from '../../../helper/utility';
import {
  fetchWorkingTime,
  resetWorkingTime,
  saveWorkingTime,
} from '../../../modules/driverWorkingTime';

const mapStateToProps = state => {
  const { driverWorkingTime } = state.app;
  const {
    selectedDay,
    isError,
    workingTime,
    checkWorkingTime,
  } = driverWorkingTime;

  const updatedTime = [];

  workingTime.forEach((time, index) => {
    if (!_.isEqual(time.WorkingHour, checkWorkingTime[index].WorkingHour)) {
      const newTime = _.cloneDeep(time);
      newTime.DayOfWeek =
        configValues.DAY_OF_WEEK[newTime.DayOfWeek.toUpperCase()].key;
      newTime.WorkingHour = _.map(newTime.WorkingHour, workingHour => {
        const formattedData = {
          StartTime: `1970-01-01T${getTimeFormat(
            workingHour.StartTime.hour,
            workingHour.StartTime.minute
          )}:00.000Z`,
          EndTime: `1970-01-01T${getTimeFormat(
            workingHour.EndTime.hour,
            workingHour.EndTime.minute
          )}:00.000Z`,
        };

        return formattedData;
      });

      updatedTime.push(newTime);
    }
  });

  return {
    selectedDay,
    isError,
    updatedTime,
  };
};

const mapDispatchToProps = dispatch => {
  const dispatchData = bindActionCreators(
    {
      fetchWorkingTime,
      resetWorkingTime,
      saveWorkingTime,
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
    this.closeModal = this.closeModal.bind(this);
    this.saveWorkingTime = this.saveWorkingTime.bind(this);
  }

  closeModal() {
    this.props.closeModal();
  }

  saveWorkingTime() {
    const { updatedTime } = this.props;
    this.props.saveWorkingTime(updatedTime);
    this.closeModal();
  }

  render() {
    const {
      profilePicture,
      driver,
      isError,
      selectedDay,
      updatedTime,
    } = this.props;

    return (
      <ModalContainer>
        <ModalDialog>
          <div className={styles.modalTitle}>
            Set Driver&apos;s Availability
            <div
              className={styles.closeModal}
              role="none"
              onClick={this.closeModal}
            >
              &times;
            </div>
          </div>
          {isError &&
            <div className={styles.modalError}>
              Invalid working hour for {selectedDay.value}
            </div>}
          <div className={styles.modalBody}>
            <DayContent profilePicture={profilePicture} driver={driver} />
            <TimeContent />
          </div>
          <div className={styles.modalFooter}>
            <button
              className={styles.modalFooter__cancel}
              onClick={this.closeModal}
            >
              Cancel
            </button>
            <button
              className={styles.modalFooter__save}
              disabled={isError || updatedTime.length === 0}
              onClick={this.saveWorkingTime}
            >
              Save
            </button>
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
  resetWorkingTime: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  isError: PropTypes.bool,
  selectedDay: PropTypes.object,
  saveWorkingTime: PropTypes.func.isRequired,
  updatedTime: PropTypes.array.isRequired,
};
/* eslint-enable */

DriverWorkHourModal.defaultProps = {
  profilePicture: configValues.IMAGES.DEFAULT_PROFILE,
  driver: {},
  isError: false,
  selectedDay: {},
};

export default connect(mapStateToProps, mapDispatchToProps)(
  DriverWorkHourModal
);
