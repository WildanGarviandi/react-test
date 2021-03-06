import React from 'react';
import { connect } from 'react-redux';

import * as _ from 'lodash';
import classNaming from 'classnames';
import moment from 'moment';

import { TripParser } from '../modules/trips';
import styles from './styles.scss';
import * as Hubs from '../modules/hubs';
import * as OutboundTrips from './outboundTripsService';
import { ButtonWithLoading } from '../views/base';
import { DropdownWithState } from '../views/base/dropdown';
import config from '../config/configValues.json';

const vehicles = {};
_.each(config.vehicle, vehicle => {
  vehicles[vehicle.value.toUpperCase()] = vehicle.key;
});

export function FullAddress(address) {
  const Addr =
    address.Address1 &&
    address.Address2 &&
    address.Address1.length < address.Address2.length
      ? address.Address2
      : address.Address1;
  return _.chain([Addr])
    .filter(str => str && str.length > 0)
    .value()
    .join(', ');
}

export function TripDropOff(trip) {
  const destinationHub =
    trip.DestinationHub && FullAddress(trip.DestinationHub);
  const dropoffAddress =
    trip.DropoffAddress && FullAddress(trip.DropoffAddress);

  return {
    address: destinationHub || dropoffAddress || '',
    city:
      (trip.DropoffAddress && trip.DropoffAddress.City) ||
      (trip.District && trip.District.City) ||
      '',
    state:
      (trip.DropoffAddress && trip.DropoffAddress.State) ||
      (trip.District && trip.District.Province) ||
      '',
  };
}

export function AssignedTo(trip) {
  const className =
    trip.Driver &&
    trip.Driver.Vehicle &&
    trip.Driver.Vehicle.VehicleID === vehicles.MOTORCYCLE
      ? styles.iconVehicleMotor
      : styles.iconVehicleMiniVan;
  const isActionDisabled =
    (trip.FleetManager && trip.FleetManager.CompanyDetail) ||
    trip.Driver ||
    trip.ExternalTrip;

  return {
    className: trip.Driver && trip.Driver.Vehicle ? className : '',
    companyName:
      trip.FleetManager && trip.FleetManager.CompanyDetail
        ? trip.FleetManager.CompanyDetail.CompanyName
        : '',
    driverDetail: trip.Driver
      ? `${trip.Driver.FirstName} ${trip.Driver.LastName} / ${trip.Driver
          .CountryCode} ${trip.Driver.PhoneNumber}`
      : '',
    thirdPartyLogistic: trip.ExternalTrip
      ? trip.ExternalTrip.Transportation
      : '',
    awbNumber:
      trip.ExternalTrip && trip.ExternalTrip.AwbNumber
        ? ` ( ${trip.ExternalTrip.AwbNumber} )`
        : '',
    isActionDisabled,
  };
}

export function Remarks(trip) {
  let notes = '';

  if (trip.Notes) {
    notes = trip.Notes;
    if (notes.length > 50) {
      notes = `${notes.substring(0, 50)} ...`;
    }
  }

  return notes;
}

export function Weight(trip) {
  let result = 0;

  if (trip.UserOrderRoutes) {
    trip.UserOrderRoutes.forEach(val => {
      result += val.UserOrder.PackageWeight;
    });
  }

  return result;
}

export function DstHub(trip) {
  if (trip && trip.DestinationHub) {
    return `Hub -- ${trip.DestinationHub.Name}`;
  }
}

export function DstDistrict(trip) {
  if (trip && trip.District) {
    return `District -- ${trip.District.Name}`;
  }
}

export function NextSuggestion(trip) {
  if (trip) {
    const nextSuggestion = [];
    // trip.NextDestinationSuggestion.forEach(p => {
    for (const p in trip.NextDestinationSuggestion) {
      if (
        Object.prototype.hasOwnProperty.call(
          trip.NextDestinationSuggestion,
          p
        ) &&
        p !== 'NO_SUGGESTION'
      ) {
        nextSuggestion.push(
          `${p} (${trip.NextDestinationSuggestion[p]}${trip
            .NextDestinationSuggestion[p] > 1
            ? ' orders'
            : ' order'})`
        );
      }
    }

    return nextSuggestion;
  }
}

export function ProcessTrip(trip) {
  const parsedTrip = TripParser(trip);
  const dropoff = TripDropOff(trip);
  let tripType;
  let nextDestination;
  let isAssigned = false;

  if (trip.DestinationHub) {
    tripType = 'Hub';
    nextDestination = trip.DestinationHub && `Hub ${trip.DestinationHub.Name}`;
    if (trip.FleetManager || trip.Driver || trip.ExternalTrip) {
      isAssigned = true;
    }
  } else if (trip.FleetManager || trip.Driver || trip.ExternalTrip) {
    tripType = 'Last Mile';
    nextDestination = 'Dropoff';
    isAssigned = true;
    if (trip.DestinationHub) {
      tripType = 'Hub';
      nextDestination =
        trip.DestinationHub && `Hub ${trip.DestinationHub.Name}`;
    }
  } else {
    tripType = 'No Destination Yet';
    nextDestination = '-';
  }

  return {
    containerNumber: trip.ContainerNumber,
    district: trip.District && trip.District.Name,
    tripID: `TRIP-${trip.TripID}`,
    fleet: AssignedTo(trip),
    driver: trip.Driver && `${trip.Driver.FirstName} ${trip.Driver.LastName}`,
    nextDestination,
    dropoffCity: dropoff.city,
    dropoffState: dropoff.state,
    dropoffTime: moment(new Date(trip.DropoffTime)).format(
      'DD MMM YYYY HH:mm:ss'
    ),
    key: trip.TripID,
    pickup: trip.PickupAddress && trip.PickupAddress.Address1,
    pickupTime: moment(new Date(trip.PickupTime)).format(
      'DD MMM YYYY HH:mm:ss'
    ),
    status: trip.OrderStatus && trip.OrderStatus.OrderStatus,
    tripNumber: trip.TripNumber,
    tripType,
    webstoreNames: parsedTrip.WebstoreNames,
    numberPackages: trip.TotalOrders,
    nextSuggestion: NextSuggestion(trip),
    weight: trip.TotalWeight,
    remarks: Remarks(trip),
    deadline: moment(new Date(trip.CreatedDate)).add(
      config.outboundDeadlineFromCreated,
      'hours'
    ),
    actions: trip.TripID,
    isActionDisabled: AssignedTo(trip).isActionDisabled,
    vehicleID:
      trip.Driver && trip.Driver.Vehicle && trip.Driver.Vehicle.VehicleID,
    isAssigned,
  };
}

const HubSetterClass = React.createClass({
  componentWillMount() {
    this.props.FetchList();
  },
  getInitialState() {
    return { selected: {} };
  },
  selectHub(val) {
    this.setState({ selected: val });
  },
  pickHub() {
    this.props.SetHub(this.state.selected.key || this.props.nextHubID);
    if (this.props.onSelect) {
      this.props.onSelect();
    }
  },
  render() {
    const { hubs, isFetching, isUpdating, nextHub } = this.props;

    return (
      <div className={styles.hubSetter}>
        <span>Destination Hub : </span>
        {isFetching && <span>Fetching Hub List...</span>}
        {!isFetching &&
          <span>
            <span className={classNaming(styles.districtsWrapper)}>
              <DropdownWithState
                options={hubs}
                handleSelect={this.selectHub}
                initialValue={nextHub}
              />
            </span>
            <div className={classNaming(styles.buttonWrapper)}>
              <ButtonWithLoading
                textBase="Set Destination"
                textLoading="Setting Destination"
                disabled={!this.state.selected.key && !this.props.nextHubID}
                onClick={this.pickHub}
                isLoading={isUpdating}
                styles={{ base: styles.normalBtn }}
              />
            </div>
          </span>}
      </div>
    );
  },
});

function mapState(state, ownParams) {
  const { hubs, outboundTripsService } = state.app;
  const { isFetching, list } = hubs;
  const { isHubUpdating } = outboundTripsService;
  const { trip } = ownParams;

  const nextHub = trip.DestinationHub && trip.DestinationHub.Name;
  const nextHubID = trip.DestinationHub && trip.DestinationHub.HubID;

  return {
    isFetching,
    isUpdating: isHubUpdating,
    hubs: _.map(list, hub => {
      const data = { key: hub.HubID, value: hub.Name };
      return data;
    }),
    nextHub,
    nextHubID,
  };
}

function mapDispatch(dispatch, ownParams) {
  return {
    FetchList: () => {
      dispatch(Hubs.fetchNextDestinationList());
    },
    SetHub: hubID => {
      dispatch(OutboundTrips.setHub(ownParams.trip.TripID, hubID));
    },
  };
}

const HubSetter = connect(mapState, mapDispatch)(HubSetterClass);

export { HubSetter };
