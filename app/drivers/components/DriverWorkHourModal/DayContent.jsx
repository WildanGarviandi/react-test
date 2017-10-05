import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import styles from './styles.scss';
import ImagePreview from '../../../views/base/imagePreview';
import configValues from '../../../config/configValues.json';
import { ButtonStandard } from '../../../components/Button';
import { selectWorkingDay } from '../../../modules/driverWorkingTime';

const mapStateToProps = state => {
  const { driverWorkingTime } = state.app;
  const { DayOfWeek, isError } = driverWorkingTime;

  return {
    DayOfWeek,
    isError
  };
};

const mapDispatchToProps = dispatch => {
  const dispatchData = bindActionCreators(
    {
      selectWorkingDay
    },
    dispatch
  );

  return dispatchData;
};

class DayContent extends PureComponent {
  constructor(props) {
    super(props);
    this.handleSelectDay = this.handleSelectDay.bind(this);
  }

  handleSelectDay(day) {
    this.props.selectWorkingDay(day);
  }

  render() {
    const { driver, DayOfWeek, isError } = this.props;

    return (
      <div className={styles.dayContent}>
        <div className={styles.dayContent__image}>
          <ImagePreview imageUrl={this.props.profilePicture} />
          <span className={styles['dayContent__image-text']}>
            {driver.FirstName} {driver.LastName}
          </span>
        </div>
        <div className={styles.dayContent__week}>
          {DayOfWeek.map((day, index) => {
            const buttonAction = {
              textBase: day.value,
              onClick: () => {
                this.handleSelectDay(day);
              },
              styles: {
                base: styles.dayContent__button
              }
            };
            return (
              <ButtonStandard
                {...buttonAction}
                key={day.key}
                isLoading={index > 0 && isError}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

/* eslint-disable */
DayContent.propTypes = {
  profilePicture: PropTypes.string,
  driver: PropTypes.object,
  DayOfWeek: PropTypes.array,
  selectWorkingDay: PropTypes.func.isRequired,
  isError: PropTypes.bool
};
/* eslint-enable */

DayContent.defaultProps = {
  profilePicture: configValues.IMAGES.DEFAULT_PROFILE,
  driver: {},
  DayOfWeek: [],
  isError: false
};

export default connect(mapStateToProps, mapDispatchToProps)(DayContent);
