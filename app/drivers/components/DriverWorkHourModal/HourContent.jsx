import React, { PureComponent } from 'react';
import FontAwesome from 'react-fontawesome';

import PropTypes from 'prop-types';

import styles from './styles.scss';
import HourDropdown from './HourDropdown';

class HourContent extends PureComponent {
  constructor(props) {
    super(props);
    this.handleToggleFrom = this.handleToggleFrom.bind(this);
    this.handleToggleTo = this.handleToggleTo.bind(this);
    this.handleSelectFrom = this.handleSelectFrom.bind(this);
    this.handleSelectTo = this.handleSelectTo.bind(this);
    this.closeAllHourDropdown = this.closeAllHourDropdown.bind(this);
    this.deleteWorkingTime = this.deleteWorkingTime.bind(this);
  }

  deleteWorkingTime() {
    const { workingTime } = this.props;

    this.props.deleteWorkingTime(workingTime);
  }

  handleToggleFrom(selectedWorkingHour) {
    this.props.handleToggle(selectedWorkingHour, 'isChangeFromHour');
  }

  handleToggleTo(selectedWorkingHour) {
    this.props.handleToggle(selectedWorkingHour, 'isChangeToHour');
  }

  handleSelectFrom(date, key) {
    const { workingTime, handleSelect } = this.props;

    handleSelect(date.name, workingTime.selectedTo, key);
  }

  closeAllHourDropdown() {
    this.props.handleToggle();
  }

  handleSelectTo(date, key) {
    const { workingTime, handleSelect } = this.props;
    
    handleSelect(workingTime.selectedFrom, date.name, key);
  }

  render() {
    const { workingTime } = this.props;

    return (
      <div className={styles.workingTime}>
        {!workingTime.isChangeFromHour && (
          <div
            className={styles.textHour__left}
            role="none"
            onClick={() => this.handleToggleFrom(workingTime)}
          >
            <p className={styles.textHour__title}>From</p>
            <p>{workingTime.selectedFrom}</p>
          </div>
        )}
        {workingTime.isChangeFromHour && (
          <HourDropdown
            workingTime={workingTime}
            attr={'from'}
            handleSelect={this.handleSelectFrom}
            handleClickOutside={this.closeAllHourDropdown}
            dropdownStyles={styles['dropdownMenu--left']}
          />
        )}
        <div style={{ marginTop: 10 }}>
          <span>-</span>
        </div>
        {!workingTime.isChangeToHour && (
          <div
            className={styles.textHour__right}
            role="none"
            onClick={() => this.handleToggleTo(workingTime)}
          >
            <p className={styles.textHour__title}>To</p>
            <p>{workingTime.selectedTo}</p>
          </div>
        )}
        {workingTime.isChangeToHour && (
          <HourDropdown
            workingTime={workingTime}
            attr={'to'}
            handleSelect={this.handleSelectTo}
            handleClickOutside={this.closeAllHourDropdown}
            dropdownStyles={styles['dropdownMenu--right']}
          />
        )}
        <div
          role="none"
          className={styles.action__trash}
          onClick={this.deleteWorkingTime}
        >
          <FontAwesome size="lg" name={'trash'} />
        </div>
      </div>
    );
  }
}

/* eslint-disable */
HourContent.propTypes = {
  workingTime: PropTypes.object.isRequired,
  handleToggle: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  deleteWorkingTime: PropTypes.func.isRequired
};
/* eslint-enable */

export default HourContent;
