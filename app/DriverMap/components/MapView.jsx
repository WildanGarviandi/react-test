import React from 'react';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  OverlayView,
} from 'react-google-maps';

import PropTypes from 'prop-types';

import Details from './DriverDetails';
import configValues from '../../config/configValues.json';
import config from '../../../config.json';
import styles from './styles.scss';

const DriverPin = ({ driver, openDetails, selectedDriver }) =>
  <OverlayView
    position={{ lat: driver.Latitude, lng: driver.Longitude }}
    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
  >
    <div className={styles.overlay__container}>
      <img
        role="none"
        onClick={() => openDetails(driver.DriverCurrentLocationID)}
        alt="driver"
        src={
          driver.isAvailable
            ? configValues.IMAGES.PIN_DRIVER_GREEN
            : configValues.IMAGES.PIN_DRIVER_RED
        }
        className={styles['overlay__pin-driver']}
      />
      <h1>
        {driver.isAvailable}
      </h1>
      {selectedDriver === driver.DriverCurrentLocationID &&
        <Details
          orders={driver.NumberOfOrders}
          driver={driver.Driver}
          isAvailable={driver.isAvailable}
          setCurrentDriver={openDetails}
          numberOfOrders={driver.NumberOfOrders}
        />}
    </div>
  </OverlayView>;

/* eslint-disable */
DriverPin.propTypes = {
  driver: PropTypes.any.isRequired,
  openDetails: PropTypes.func.isRequired,
  selectedDriver: PropTypes.any,
};
/* eslint-enable */

DriverPin.defaultProps = {
  selectedDriver: null,
};

const GoogleMaps = withScriptjs(
  withGoogleMap(props =>
    <GoogleMap
      ref={props.onMapLoad}
      defaultZoom={11}
      defaultCenter={{ lat: -6.21462, lng: 106.84513 }}
      onClick={props.onMapClick}
    >
      {props.drivers.map(driver =>
        <DriverPin
          key={driver.DriverCurrentLocationID}
          driver={driver}
          selectedDriver={props.selectedDriver}
          openDetails={props.openDetails}
        />
      )}
    </GoogleMap>
  )
);

const MapView = ({ onMapLoad, drivers, selectedDriver, openDetails }) =>
  <GoogleMaps
    googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${config.googleMapApiKey}`}
    loadingElement={<div style={{ height: `100%` }} />}
    onMapLoad={onMapLoad}
    drivers={drivers}
    openDetails={openDetails}
    selectedDriver={selectedDriver}
    containerElement={<div className={styles['maps-container']} />}
    mapElement={<div className={styles['height-100']} />}
  />;

/* eslint-disable */
MapView.propTypes = {
  onMapLoad: PropTypes.func,
  drivers: PropTypes.array,
  selectedDriver: PropTypes.any,
  openDetails: PropTypes.func.isRequired,
};
/* eslint-enable */

MapView.defaultProps = {
  onMapLoad: () => {},
  drivers: [],
  selectedDriver: null,
};

export default MapView;
