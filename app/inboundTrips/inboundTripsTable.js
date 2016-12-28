import lodash from 'lodash';
import ClassName from 'classnames';
import moment from 'moment';
import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import * as InboundTrips from './inboundTripsService';
import {DropdownTypeAhead, Input, Pagination} from '../views/base';
import DateRangePicker from '../views/base/dateRangePicker';
import tableStyles from '../views/base/table.css';
import StatusDropdown from '../views/base/statusDropdown';
import {TripParser} from '../modules/trips';
import {formatDate} from '../helper/time';
import {modalAction} from '../modules/modals/constants';
import stylesModal from '../views/base/modal.css';
import classnaming from 'classnames';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import styles from './styles.css';

const ColumnsOrder = ['tripID', 'webstoreNames', 'weight', 'driver', 'driverPhone', 'status', 'verifiedOrders'];

const ColumnsTitle = {
  containerNumber: "Container",
  district: "District",
  driver: "Assigned To",
  driverPhone: "Phone",
  dropoff: "Next Destination",
  dropoffTime: "Dropoff Time",
  fleetName: "Fleet",
  pickup: "Pickup Address",
  pickupCity: "City",
  pickupState: "State",
  pickupTime: "Pickup Time",
  status: "Status",
  tripNumber: "Trip Number",
  webstoreNames: "Merchant",
  numberPackages: "Number of Packages",
  remarks: "Remarks",
  tripID: "Trip ID",
  weight: "Total Weight",
  scannedOrders: "Scanned Orders",
  verifiedOrders: "Verified Orders"
}

let fleetList = {};

const Table = React.createClass({
  render() {
    const Headers = _.map(ColumnsOrder, (columnKey) => {
      return <th key={columnKey}>{ColumnsTitle[columnKey]}</th>;
    });

    const Body = _.map(this.props.items, (item) => {
      const cells = _.map(ColumnsOrder, (columnKey) => {
        if (columnKey === 'tripID') {
          return <td className={tableStyles.td} key={columnKey}>{item[columnKey]}</td>;
        }
        if (columnKey === 'verifiedOrders') {
          return <td className={tableStyles.td} key={columnKey}><span className={styles.verifiedColumn} onClick={this.props.showModals.bind(null, item['key'])}>{item[columnKey]}</span></td>;
        }
        return <td className={tableStyles.td} key={columnKey}>{item[columnKey]}</td>;
      });

      return <tr className={tableStyles.tr} key={item.key}>{cells}</tr>;
    });

    if (this.props.isFetching) {
      return (
        <div style={{textAlign:'center'}}>
          <div style={{fontSize: 20}}>
            Fetching data....
          </div>
        </div>
      );
    } else {
      if (this.props.items.length === 0) {
        return (
          <div style={{textAlign:'center'}}>
            <img src="/img/orders-empty-state.png" />
            <div style={{fontSize: 20}}>
              You have no inbound trips
            </div>
          </div>
        );
      } else {
        return (
          <table className={tableStyles.table}>
            <thead><tr>{Headers}</tr></thead>
            <tbody>{Body}</tbody>
          </table>
        );
      }
    }
  }
});

function FullAddress(address) {
  const Addr = address.Address1 && address.Address2 && (address.Address1.length < address.Address2.length) ? address.Address2 : address.Address1;
  return lodash.chain([Addr, address.City, address.State, address.ZipCode])
    .filter((str) => (str && str.length > 0))
    .value()
    .join(', ');
}

function TripDropOff(trip) {
  const destinationHub = trip.DestinationHub && ("Hub " + trip.DestinationHub.Name + " -- " + FullAddress(trip.DestinationHub));
  const dropoffAddress = trip.DropoffAddress && FullAddress(trip.DropoffAddress);

  return destinationHub || dropoffAddress || "";
}

function ProcessTrip(trip) {
  const parsedTrip = TripParser(trip);
  const fleet = trip.FleetManager && fleetList[trip.FleetManager.UserID];
  const fleetName = fleet && fleet.CompanyDetail && fleet.CompanyDetail.CompanyName;

  return {
    containerNumber: trip.ContainerNumber,
    district: trip.District && trip.District.Name,
    driver: trip.Driver && `${trip.Driver.FirstName} ${trip.Driver.LastName}` || '-',
    driverPhone: trip.Driver && `${trip.Driver.CountryCode} ${trip.Driver.PhoneNumber}` || '-',
    dropoff: TripDropOff(trip),
    dropoffTime: formatDate(trip.DropoffTime),
    key: trip.TripID,
    tripNumber: trip.TripNumber,
    pickup: trip.PickupAddress && trip.PickupAddress.Address1,
    pickupCity: trip.PickupAddress && trip.PickupAddress.City,
    pickupState: trip.PickupAddress && trip.PickupAddress.State,
    pickupTime: formatDate(trip.PickupTime),
    status: trip.OrderStatus && trip.OrderStatus.OrderStatus,
    webstoreNames: parsedTrip.WebstoreNames,
    fleetName: fleetName || '',
    numberPackages: trip.UserOrderRoutes.length,
    remarks: trip.Notes,
    tripID: `Trip-${trip.TripID}`,
    weight: trip.Weight,
    scannedOrders: trip.ScannedOrders,
    verifiedOrders: `${trip.ScannedOrders}/${trip.UserOrderRoutes.length} order(s) are verified`
  }
}

const VerifiedOrder = React.createClass({
    render: function() {
      var orderComponents = this.props.routes.map(function(route, idx) {
        return (
          <div key={idx} className={route.OrderStatus.OrderStatus === 'DELIVERED' ? 
            styles.modalOrderMain : styles.modalOrderMainNotVerified}>
            <table>
              <tr>
                <td className={styles.modalOrderID}>
                  {route.UserOrder.UserOrderNumber}
                </td>
                <td rowSpan={2} className={styles.modalOrderVerified}>
                  {route.OrderStatus.OrderStatus === 'DELIVERED' ? 'VERIFIED' : 'NOT VERIFIED'}
                </td>
              </tr>
              <tr>
                <td className={styles.modalOrderWeight}>
                  Weight: {route.UserOrder.PackageWeight}
                </td>
              </tr>
            </table>
          </div>
        );
      });
      return <div>{orderComponents}</div>;
    }
});


const TableStateful = React.createClass({
  getInitialState() {
    return {trip: this.props.trip, filters: this.props.filters};
  },
  closeModal() {
    this.props.closeModal();    
  },
  componentWillReceiveProps(nextProps) {
    if (nextProps['trip']) {
      this.setState({                
          trip: nextProps['trip']
      });
    }
  },
  render() {
    const {filters, paginationAction, paginationState, statusParams, tripDetails, tripsIsFetching} = this.props;

    const paginationProps = _.assign({}, paginationAction, paginationState);

    const statusProps = {
      pickStatus: this.pickStatus,
      statusList: this.props.statusList,
      statusName: this.state.statusName,
    }

    const filteringAction = {
      changeFilter: this.changeFilter,
      changeFilterAndFetch: this.changeFilterAndFetch,
      fetchTrips: this.fetchTrips,
    }

    const trips = _.map(this.props.trips, ProcessTrip);
    const tableProps = {
      items: trips,
      toDetails: tripDetails,
      filteringAction, statusProps,
      filters: this.state,
      isFetching: tripsIsFetching,
      showModals: this.props.showModals
    }

    return (
      <div>
        <div style={{opacity: tripsIsFetching ? 0.5 : 1}}>
          <Table {...tableProps} />
          <Pagination {...paginationProps} />
        </div>
        {
          this.props.showDetails &&
          <ModalContainer onClose={this.closeModal}>
            <ModalDialog onClose={this.closeModal}>
              <div>
                <div className={styles.modalTitle}>
                  Trip-{this.state.trip.TripID}
                </div> 
                <div className={styles.topDesc}>
                  <div className={styles.modalDesc}>
                    <p className={styles.mainLabel}>
                      From {this.state.trip.ListWebstore}
                    </p>
                    <p>
                      {this.state.trip.UserOrderRoutes.length} items
                    </p>
                  </div>
                  <div className={styles.modalDesc2}>
                    <p>
                      Total Weight
                    </p>
                    <p className={styles.weightLabel}>
                      {this.state.trip.Weight}
                    </p>                    
                  </div>
                <div style={{clear: 'both'}} />
                </div>
                <div className={styles.orderList}>
                  <VerifiedOrder routes={this.state.trip.UserOrderRoutes} />
                </div>
              </div>
            </ModalDialog>
          </ModalContainer>
        }
      </div>
    );
  }
});

function StateToProps(state) {
  const {inboundTrips, driversStore} = state.app;
  const {isFetching, limit, total, currentPage, trips, filters, showDetails, tripActive} = inboundTrips;

  fleetList = driversStore.fleetList.dict;

  const paginationState = {
    currentPage: currentPage,
    limit: limit,
    total: total,
  }

  const statusList = state.app.containers.statusList;
  const trip = TripParser(tripActive)

  return {
    paginationState, trips, tripsIsFetching: isFetching,
    statusList: _.chain(statusList).map((key, val) => [val, key]).sortBy((arr) => (arr[1])).map((arr) => (arr[0])).value(),
    nameToID: _.reduce(statusList, (memo, key, val) => {
      memo[val] = key;
      return memo;
    }, {}),
    filters,
    showDetails, 
    trip
  };
}

function DispatchToProps(dispatch, ownProps) {
  return {
    initialLoad() {
      dispatch(InboundTrips.FetchList());
    },
    changeFilter: (filters) => {
      dispatch(InboundTrips.AddFilters(filters));
    },
    paginationAction: {
      setCurrentPage(pageNum) {
        dispatch(InboundTrips.SetCurrentPage(pageNum));
      },
      setLimit(limit) {
        dispatch(InboundTrips.SetLimit(limit));
      },
    },
    tripDetails(id) {
      dispatch(push(`/trips/${id}/`));
    },
    showModals: (tripID) => {
      dispatch(InboundTrips.ShowDetails(tripID));
    },
    closeModal: () => {
      dispatch(InboundTrips.HideDetails());
    },
  };
}

export default connect(StateToProps, DispatchToProps)(TableStateful);
