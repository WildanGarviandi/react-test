import classNaming from 'classnames';
import React from 'react';
import styles from './setterStyles.css';
import DistrictSetter from './districtSetter';
import HubSetter from './HubSetter';

function HeaderWithDestination({nextDestination}) {
  return (
    <span>Next Destination: {nextDestination}</span>
  );
}

function HeaderWithoutDestination() {
  return (
    <span>{"Select Next Destination"}</span>
  );
}

function DstHub(trip) {
  if(trip.DestinationHub) {
    return `Hub -- ${trip.DestinationHub.Name}`;
  }

  return;
}

function DstDistrict(trip) {
  console.log('t', trip);
  if(trip.District) {
    return `District -- ${trip.District.Name}`;
  }

  return;
}

const FirstSetting = React.createClass({
  render() {
    const {accordionAction, accordionState, trip} = this.props;
    const nextDestination = DstHub(trip) || DstDistrict(trip);

    const headerClass = classNaming(styles.setterHeader, {
      [styles.headerDone]: nextDestination,
    });

    const leftStyle = classNaming(styles.setterLeft, {
      [styles.disabled]: nextDestination && nextDestination.substr(0,3) !== "Hub"
    });
    const rightStyle = classNaming(styles.setterRight, {
      [styles.disabled]: nextDestination && nextDestination.substr(0,3) !== "Dis"
    });

    return (
      <div className={styles.setterWrapper}>
        <div className={headerClass} onClick={accordionAction.toggleView}>
        {
          nextDestination ?
          <HeaderWithDestination nextDestination={nextDestination} />
          :
          <HeaderWithoutDestination />
        }
        </div>
        {
          accordionState === "expanded" &&
          <div className={styles.setterBody}>
            <div className={leftStyle}>
              <HubSetter trip={trip} nextDestination={nextDestination} />
              <div className={styles.shadow}></div>
            </div>
            <div className={rightStyle}>
              <DistrictSetter tripID={trip.TripID} nextDestination={nextDestination} />
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

export default FirstSetting;
