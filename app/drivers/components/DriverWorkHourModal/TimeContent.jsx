import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import FontAwesome from 'react-fontawesome';

import * as _ from 'lodash';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import HourContent from './HourContent';
import styles from './styles.scss';
import getWorkingHourList from '../../helper';
import { getTimeFormat } from '../../../helper/utility';
import {
  addWorkingHour,
  setWorkingHour,
  deleteWorkingHour
} from '../../../modules/driverWorkingTime';

const mapStateToProps = state => {
  const { driverWorkingTime } = state.app;
  const { selectedDay, workingTime } = driverWorkingTime;

  return {
    selectedDay,
    workingTime
  };
};

const mapDispatchToProps = dispatch => {
  const dispatchData = bindActionCreators(
    {
      addWorkingHour,
      setWorkingHour,
      deleteWorkingHour
    },
    dispatch
  );

  return dispatchData;
};

class TimeContent extends PureComponent {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.addWorkingTime = this.addWorkingTime.bind(this);
    this.deleteWorkingTime = this.deleteWorkingTime.bind(this);

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
      workingHourList: getWorkingHourList()
    };
  }

  componentWillReceiveProps(nextProps) {
    const selectedDay = nextProps.selectedDay.value;

    if (selectedDay) {
      const newWorkingTimes = _.cloneDeep(this.state.workingTimes);
      const newWorkingHour = _.find(nextProps.workingTime, time => {
        const isValid = time.DayOfWeek === selectedDay;
        return isValid;
      }).WorkingHour;

      newWorkingTimes[selectedDay.toUpperCase()] = _.map(
        newWorkingHour,
        workingHour => {
          const data = {
            key: workingHour.key,
            from: this.state.workingHourList,
            selectedFrom: getTimeFormat(
              workingHour.StartTime.hour,
              workingHour.StartTime.minute
            ),
            to: this.state.workingHourList,
            selectedTo: getTimeFormat(
              workingHour.EndTime.hour,
              workingHour.EndTime.minute
            ),
            isChangeFromHour: false,
            isChangeToHour: false
          };

          return data;
        }
      );

      this.setState({
        workingTimes: newWorkingTimes
      });
    }
  }

  handleSelect(dateFrom, dateTo, key) {
    this.props.setWorkingHour(dateFrom, dateTo, key);
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

  addWorkingTime() {
    this.props.addWorkingHour();
  }

  deleteWorkingTime(workingTime) {
    this.props.deleteWorkingHour(workingTime.key);
  }

  render() {
    const { selectedDay } = this.props;

    let workingTimes = [];

    if (selectedDay.value) {
      workingTimes = this.state.workingTimes[selectedDay.value.toUpperCase()];
    }

    return (
      <div className={styles.timeContent}>
        {selectedDay.value && (
          <div className={styles.timeContentHeader}>
            <p className={styles.timeContentHeader__title}>
              Please set this driver&apos;s availability
            </p>
            <div
              role="none"
              className={styles.action__plus}
              onClick={this.addWorkingTime}
            >
              <FontAwesome size="lg" name={'plus'} />
            </div>
          </div>
        )}
        <p className={styles.timeContentHeader__day}>{selectedDay.value}</p>
        {workingTimes.length > 0 &&
          workingTimes.map(workingTime => {
            const tmpl = (
              <HourContent
                key={workingTime.key}
                workingTime={workingTime}
                handleToggle={this.handleToggle}
                handleSelect={this.handleSelect}
                deleteWorkingTime={this.deleteWorkingTime}
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
  workingTime: PropTypes.array,
  addWorkingHour: PropTypes.func.isRequired,
  setWorkingHour: PropTypes.func.isRequired,
  deleteWorkingHour: PropTypes.func.isRequired
};
/* eslint-enable */

TimeContent.defaultProps = {
  selectedDay: {},
  workingTime: []
};

export default connect(mapStateToProps, mapDispatchToProps)(TimeContent);
