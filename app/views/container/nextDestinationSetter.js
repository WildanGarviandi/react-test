import classNaming from 'classnames';
import React from 'react';
import styles from './setterStyles.css';
import DistrictSetter from './districtSetter';
import HubSetter from './hubSetter';

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
  tryToggle() {
    const {trip} = this.props;
    if(!trip.Driver) {
      this.props.accordionAction.toggleView();
    }
  },
  render() {
    const {accordionAction, accordionState, trip, nextSuggestion} = this.props;
    const nextDestination = DstHub(trip) || DstDistrict(trip);
    const haveSet = trip.Driver || trip.ExternalTrip;

    const headerClass = classNaming(styles.setterHeader, {
      [styles.haveDriver]: haveSet,
    });

    const leftStyle = classNaming(styles.setterLeft, {
      [styles.disabled]: false
    });
    const rightStyle = classNaming(styles.setterRight, {
      [styles.disabled]: false
    });

    const suggestionComponents = nextSuggestion.map(function(suggestion, idx) {
        return (
            <li key={ idx }>{suggestion}</li>
        );
    });

    return (
      <div className={styles.setterWrapper}>
        <div className={headerClass}>
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
            { nextSuggestion.length > 0 &&
              <div>
                Maybe send this to:
                <ul>
                  {suggestionComponents}
                </ul>
              </div>
            }
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
