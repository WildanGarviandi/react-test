import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import * as _ from 'lodash';
import PropTypes from 'prop-types';

import HourDropdown from './HourDropdown';
import styles from './styles.scss';
import { ButtonStandard } from '../../../components/Button';
import getWorkingHourList from '../../helper';
import { getTimeFormat } from '../../../helper/utility';

const mapStateToProps = state => {
  const { driverWorkingTime } = state.app;
  const { selectedDay, workingTime } = driverWorkingTime;

  return {
    selectedDay,
    workingTime
  };
};

class TimeContent extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      workingTimes: {
        MONDAY: [],
        TUESDAY: [],
        WEDNESDAY: [],
        THURSDAY: [],
        FRIDAY: [],
        SATURDAY: [],
        SUNDAY: []
      }
    };
    this.handleToggleFrom = this.handleToggleFrom.bind(this);
    this.handleToggleTo = this.handleToggleTo.bind(this);
    this.closeAllHourDropdown = this.closeAllHourDropdown.bind(this);
    this.handleSelectFrom = this.handleSelectFrom.bind(this);
    this.handleSelectTo = this.handleSelectTo.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const selectedDay = nextProps.selectedDay.value;
    const newWorkingTimes = _.cloneDeep(this.state.workingTimes);
    const newWorkingHour = _.find(nextProps.workingTime, time => {
      const isValid = time.DayOfWeek === selectedDay;
      return isValid;
    }).WorkingHour;

    newWorkingHour.forEach((workingHour, index) => {
      newWorkingTimes[selectedDay.toUpperCase()][index] = {
        key: index,
        from: getWorkingHourList(workingHour.EndTime),
        selectedFrom: getTimeFormat(
          workingHour.StartTime.hour,
          workingHour.StartTime.to
        ),
        to: getWorkingHourList(workingHour.EndTime),
        selectedTo: getTimeFormat(
          workingHour.EndTime.hour,
          workingHour.EndTime.to
        ),
        isChangeFromHour: false,
        isChangeToHour: false
      };
    });

    this.setState({
      workingTimes: newWorkingTimes
    });
  }

  handleSelect(date, key, attr) {
    const { selectedDay } = this.props;
    const selectedAttr = selectedDay.value.toUpperCase();

    const workingTimes = _.cloneDeep(this.state.workingTimes);

    workingTimes[selectedAttr][key][attr] = date.name;
    workingTimes[selectedAttr][key].isChangeFromHour = false;
    workingTimes[selectedAttr][key].isChangeToHour = false;

    this.setState({
      workingTimes
    });
  }

  handleSelectFrom(date, key) {
    this.handleSelect(date, key, 'selectedFrom');
  }

  handleSelectTo(date, key) {
    this.handleSelect(date, key, 'selectedTo');
  }

  handleToggle(selectedWorkingHour, attr) {
    const { selectedDay } = this.props;
    const selectedAttr = selectedDay.value.toUpperCase();

    const workingTimes = _.cloneDeep(this.state.workingTimes);

    workingTimes[selectedAttr] = _.map(
      workingTimes[selectedAttr],
      workingHour => {
        const newWorkingHour = _.cloneDeep(workingHour);
        newWorkingHour.isChangeFromHour = false;
        newWorkingHour.isChangeToHour = false;

        if (
          selectedWorkingHour &&
          newWorkingHour.key === selectedWorkingHour.key
        ) {
          newWorkingHour[attr] = !selectedWorkingHour[attr];
        }

        return newWorkingHour;
      }
    );

    this.setState({
      workingTimes
    });
  }

  handleToggleFrom(selectedWorkingHour) {
    this.handleToggle(selectedWorkingHour, 'isChangeFromHour');
  }

  handleToggleTo(selectedWorkingHour) {
    this.handleToggle(selectedWorkingHour, 'isChangeToHour');
  }

  closeAllHourDropdown() {
    this.handleToggle();
  }

  render() {
    const { selectedDay } = this.props;

    let workingTimes = [];

    if (selectedDay.value) {
      workingTimes = this.state.workingTimes[selectedDay.value.toUpperCase()];
    }

    return (
      <div className={styles.timeContent}>
        <p className={styles.timeContent__title}>
          {selectedDay.value && "Please set this driver's availability on"}
        </p>
        <p className={styles.timeContent__day}>
          {selectedDay.value}
        </p>
        {workingTimes.length > 0 &&
          workingTimes.map(workingTime => {
            const tmpl = (
              <div key={workingTime.key} className={styles.workingTime}>
                {!workingTime.isChangeFromHour &&
                  <div
                    className={styles.textHour}
                    role="none"
                    onClick={() => this.handleToggleFrom(workingTime)}
                  >
                    <p className={styles.textHour__title}>From</p>
                    <p>
                      {workingTime.selectedFrom}
                    </p>
                  </div>}
                {workingTime.isChangeFromHour &&
                  <HourDropdown
                    workingTime={workingTime}
                    attr={'from'}
                    handleSelect={this.handleSelectFrom}
                    handleClickOutside={this.closeAllHourDropdown}
                  />}
                {!workingTime.isChangeToHour &&
                  <div
                    className={styles.textHour}
                    role="none"
                    onClick={() => this.handleToggleTo(workingTime)}
                  >
                    <p className={styles.textHour__title}>To</p>
                    <p>
                      {workingTime.selectedTo}
                    </p>
                  </div>}
                {workingTime.isChangeToHour &&
                  <HourDropdown
                    workingTime={workingTime}
                    attr={'to'}
                    handleSelect={this.handleSelectTo}
                    handleClickOutside={this.closeAllHourDropdown}
                  />}
              </div>
            );

            return tmpl;
          })}
      </div>
    );
  }
}

/* eslint-disable */
TimeContent.propTypes = {
  selectedDay: PropTypes.object,
  workingTime: PropTypes.array.isRequired
};
/* eslint-enable */

TimeContent.defaultProps = {
  selectedDay: {}
};

export default connect(mapStateToProps, null)(TimeContent);
