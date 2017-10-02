import React from 'react';
import { withGoogleMap, GoogleMap, OverlayView } from 'react-google-maps';

import PropTypes from 'prop-types';

import Details from './DriverDetails';
import config from '../../config/configValues.json';
import styles from './styles.scss';

const GoogleMaps = withGoogleMap(props =>
  <GoogleMap
    ref={props.onMapLoad}
    defaultZoom={11}
    defaultCenter={{ lat: -6.21462, lng: 106.84513 }}
    onClick={props.onMapClick}
  >
    {props.drivers.map(driver =>
      <OverlayView
        key={driver.DriverCurrentLocationID}
        position={{ lat: driver.Latitude, lng: driver.Longitude }}
        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      >
        <div className={styles.overlay__container}>
          <img
            role="none"
            onClick={() => props.openDetails(driver.DriverCurrentLocationID)}
            alt="driver"
            src={config.IMAGES.PIN_DRIVER_GREEN}
            className={styles['overlay__pin-driver']}
          />
          {props.selectedDriver === driver.DriverCurrentLocationID &&
            <Details
              driver={driver.Driver}
              setCurrentDriver={props.openDetails}
            />}
        </div>
      </OverlayView>
    )}
  </GoogleMap>
);

const Map = ({ onMapLoad, drivers, selectedDriver, openDetails }) =>
  <GoogleMaps
    onMapLoad={onMapLoad}
    drivers={drivers}
    openDetails={openDetails}
    selectedDriver={selectedDriver}
    containerElement={<div className={styles['maps-container']} />}
    mapElement={<div className={styles['height-100']} />}
  />;

export default Map;

/* eslint-disable */
Map.propTypes = {
  onMapLoad: PropTypes.func,
  drivers: PropTypes.array,
  selectedDriver: PropTypes.any,
  openDetails: PropTypes.func.isRequired,
};
/* eslint-enable */

Map.defaultProps = {
  onMapLoad: () => {},
  drivers: [],
  selectedDriver: null,
};
