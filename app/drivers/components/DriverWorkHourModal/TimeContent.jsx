import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import * as _ from 'lodash';
import PropTypes from 'prop-types';

import HourContent from './HourContent';
import styles from './styles.scss';
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
      },
      action: {
        ADD: {
          icon: 'plus',
          class: styles.action__plus
        },
        DELETE: {
          icon: 'trash',
          class: styles.action__trash
        }
      }
    };
    this.handleSelect = this.handleSelect.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const selectedDay = nextProps.selectedDay.value;

    if (selectedDay) {
      const newWorkingTimes = _.cloneDeep(this.state.workingTimes);
      const newWorkingHour = _.find(nextProps.workingTime, time => {
        const isValid = time.DayOfWeek === selectedDay;
        return isValid;
      }).WorkingHour;

      newWorkingTimes[selectedDay.toUpperCase()] = [];

      newWorkingHour.forEach((workingHour, index) => {
        newWorkingTimes[selectedDay.toUpperCase()].push({
          key: _.uniqueId(),
          from: getWorkingHourList(
            index === 0
              ? {
                  hour: 0
                }
              : workingHour.EndTime
          ),
          selectedFrom: getTimeFormat(
            workingHour.StartTime.hour,
            workingHour.StartTime.to
          ),
          to: getWorkingHourList(
            index === 0
              ? {
                  hour: 0
                }
              : workingHour.EndTime
          ),
          selectedTo: getTimeFormat(
            workingHour.EndTime.hour,
            workingHour.EndTime.to
          ),
          isChangeFromHour: false,
          isChangeToHour: false
        });
      });

      this.setState({
        workingTimes: newWorkingTimes
      });
    }
  }

  handleSelect(date, key, attr) {
    const { selectedDay } = this.props;
    const selectedAttr = selectedDay.value.toUpperCase();

    const workingTimes = _.cloneDeep(this.state.workingTimes);

    workingTimes[selectedAttr] = _.map(
      workingTimes[selectedAttr],
      workingTime => {
        if (workingTime.key === key) {
          const newWorkingTime = _.cloneDeep(workingTime);
          newWorkingTime[attr] = date.name;
          newWorkingTime.isChangeFromHour = false;
          newWorkingTime.isChangeToHour = false;
          return newWorkingTime;
        }

        return workingTime;
      }
    );

    this.setState({
      workingTimes
    });
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
          workingTimes.map((workingTime, index) => {
            const tmpl = (
              <HourContent
                key={workingTime.key}
                workingTime={workingTime}
                handleToggle={this.handleToggle}
                handleSelect={this.handleSelect}
                action={
                  index === workingTimes.length - 1
                    ? this.state.action.ADD
                    : this.state.action.DELETE
                }
              />
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
