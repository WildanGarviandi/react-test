import classNaming from 'classnames';
import React from 'react';
import {connect} from 'react-redux';
import styles from './setterStyles.css';
import DriverSetter from './driverSetter';
import ThirdPartySetter from './thirdPartySetter';
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
    const {accordionAction, accordionState, isCentralHub, isInbound, transportMethod, trip, suggestion} = this.props;
    const leftStyle = classNaming(styles.setterLeft);

    const canSet = trip.DestinationHub || trip.District;
    const haveSet = trip.Driver || trip.ExternalTrip;

    const nextDestination = UtilHelper.UserFullName(haveSet);

    if(isInbound && !trip.ExternalTrip) {
      return (
        <DriverSetter trip={trip} />
      );
    }

    return (
      <div className={styles.setterWrapper}>
        <div className={classNaming(styles.setterHeader, {[styles.grayHeader]: !canSet, [styles.headerDone]: haveSet, [styles.haveDriver]: haveSet})}>
        {
          haveSet ?
          <div>
            {
              trip.Driver &&
              <HeaderWithDestination nextDestination={nextDestination} />
            }
            {
              trip.ExternalTrip &&
              <ThirdPartySetter trip={trip} isInbound={isInbound} />
            }
          </div>
          :
          <HeaderWithoutDestination />
        }
        </div>
        {
          accordionState === "expanded" && (trip.District || !isCentralHub) &&
          <div className={styles.setterBody}>
            <DriverSetter trip={trip} />
          </div>
        }
        {
          accordionState === "expanded" && !trip.District && isCentralHub &&
          <div className={styles.setterBody}>
            <div className={leftStyle}>
              <DriverSetter trip={trip} isInbound={isInbound} suggestion={suggestion} />
            </div>
            <div className={styles.setterRight}>
              <ThirdPartySetter trip={trip} isInbound={isInbound} />
            </div>
            <div className={styles.setterOR}>OR</div>
            <div style={{clear: 'both'}}></div>
          </div>
        }
      </div>
    );
  }
});

function StoreToSetting(store) {
  return {
    isCentralHub: store.app.userLogged.isCentralHub,
  }
}

export default connect(StoreToSetting)(SecondSetting);
