import classNaming from 'classnames';
import React from 'react';
import styles from './setterStyles.css';
import DriverSetter from './driverSetter';
import * as UtilHelper from '../../helper/utility';

function HeaderWithDestination({nextDestination}) {
  return (
    <span>Assigned Driver: {nextDestination}</span>
  );
}

function HeaderWithoutDestination() {
  return (
    <span>{"Select Driver or Insert External Trip Data"}</span>
  );
}

const SecondSetting = React.createClass({
  tryToggle() {
    const {trip} = this.props;
    if((trip.DestinationHub || trip.District) && !trip.Driver) {
      this.props.accordionAction.toggleView();
    }
  },
  render() {
    const {accordionAction, accordionState, isInbound, nextDestination, transportMethod, trip} = this.props;
    const leftStyle = classNaming(styles.setterLeft);

    const canSet = trip.DestinationHub || trip.District;
    const haveSet = trip.Driver;

    if(isInbound) {
      return (
        <DriverSetter trip={trip} />
      );
    }

    return (
      <div className={styles.setterWrapper}>
        <div className={classNaming(styles.setterHeader, {[styles.grayHeader]: !canSet, [styles.headerDone]: haveSet, [styles.haveDriver]: haveSet})}>
        {
          haveSet ?
          <HeaderWithDestination nextDestination={UtilHelper.UserFullName(haveSet)} />
          :
          <HeaderWithoutDestination />
        }
        </div>
        {
          accordionState === "expanded" &&
          <div className={styles.setterBody}>
            <div className={leftStyle}>
              <div className={styles.shadow}></div>
            </div>
            <div className={styles.setterRight}>
              <DriverSetter trip={trip} />
              <div className={styles.shadow}></div>
            </div>
            <div className={styles.setterOR}>OR</div>
            <div style={{clear: 'both'}}></div>
          </div>
        }
      </div>
    );
  }
});

export default SecondSetting;
