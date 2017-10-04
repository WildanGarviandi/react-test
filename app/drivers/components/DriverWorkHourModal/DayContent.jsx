import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import styles from './styles.scss';
import ImagePreview from '../../../views/base/imagePreview';
import configValues from '../../../config/configValues.json';
import { ButtonStandard } from '../../../components/Button';
import {
  resetWorkingTime,
  selectWorkingDay
} from '../../../modules/driverWorkingTime';

const mapStateToProps = state => {
  const { driverWorkingTime } = state.app;
  const { DayOfWeek } = driverWorkingTime;

  return {
    DayOfWeek
  };
};

const mapDispatchToProps = dispatch => {
  const dispatchData = bindActionCreators(
    {
      resetWorkingTime,
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
    this.props.resetWorkingTime();
  }

  handleSelectDay(day) {
    this.props.selectWorkingDay(day);
  }

  render() {
    const { driver, DayOfWeek } = this.props;

    return (
      <div className={styles.dayContent}>
        <div className={styles.dayContent__image}>
          <ImagePreview imageUrl={this.props.profilePicture} />
          <span className={styles['dayContent__image-text']}>
            {driver.FirstName} {driver.LastName}
          </span>
        </div>
        <div className={styles.dayContent__week}>
          {DayOfWeek.map(day => {
            const buttonAction = {
              textBase: day.value,
              onClick: () => {
                this.handleSelectDay(day);
              },
              styles: {
                base: styles.dayContent__button
              }
            };
            return <ButtonStandard {...buttonAction} key={day.key} />;
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
  resetWorkingTime: PropTypes.func.isRequired,
  selectWorkingDay: PropTypes.func.isRequired
};
/* eslint-enable */

DayContent.defaultProps = {
  profilePicture: configValues.IMAGES.DEFAULT_PROFILE,
  driver: {},
  DayOfWeek: []
};

export default connect(mapStateToProps, mapDispatchToProps)(DayContent);
