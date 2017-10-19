import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import MapView from './components/MapView';
import styles from './styles.scss';
import { fetchDriversLocation } from '../modules/drivers/actions/driversFetch';
import getDriverMapState from './selector';

const mapStateToProps = state => {
  const stateProps = getDriverMapState(state);
  return stateProps;
};

const mapDispatchToProps = dispatch => {
  const dispatchFunc = bindActionCreators({ fetchDriversLocation }, dispatch);
  return dispatchFunc;
};

class DriverMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedDriver: null,
      drivers: [],
    };

    this.onMapLoad = this.onMapLoad.bind(this);
    this.openDetails = this.openDetails.bind(this);
  }

  onMapLoad() {
    this.props.fetchDriversLocation();
    console.log('onmapload');
  }

  openDetails(id) {
    this.setState({ selectedDriver: id });
  }

  render() {
    return (
      <div>
        <Link to="/mydrivers" className={styles['driver-map__close-btn']}>
          &times;
        </Link>
        <span className={styles['driver-map__title']}>
          DRIVERS LOCATION (On Map)
        </span>
        <MapView
          openDetails={this.openDetails}
          onMapLoad={this.onMapLoad}
          drivers={this.props.driversLocation}
          selectedDriver={this.state.selectedDriver}
        />
      </div>
    );
  }
}

/* eslint-disable */
DriverMap.propTypes = {
  driversLocation: PropTypes.array.isRequired,
  fetchDriversLocation: PropTypes.func.isRequired,
};
/* eslint-enable */

export default connect(mapStateToProps, mapDispatchToProps)(DriverMap);
