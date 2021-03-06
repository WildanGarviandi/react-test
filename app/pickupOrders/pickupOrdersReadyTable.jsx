import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Link } from 'react-router';
import Countdown from 'react-cntdwn';

import * as _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';

import * as PickupOrdersReady from './pickupOrdersReadyService';
import * as NearbyFleets from '../nearbyFleets/nearbyFleetService';
import { Pagination } from '../views/base';
import { ButtonStandard } from '../components/Button';
import tableStyles from '../views/base/table.scss';
import { TripParser } from '../modules/trips';
import styles from './styles.scss';
import { ButtonCell, IDCell } from '../views/base/cells';
import { CheckboxHeader, CheckboxCell } from '../views/base/tableCell';
import { FilterTop, FilterText, FilterTopMultiple } from '../components/form';
import config from '../config/configValues.json';
import PickupOrdersModal from './pickupOrdersModal';
import { checkPermission } from '../helper/permission';
import { pickupType } from '../modules/orders';

const ColumnsOrder = ['checkbox', 'tripID', 'pickupType', 'webstoreNames', 'weight', 'quantity', 'pickup', 'pickupCity', 'pickupZip', 'deadline', 'action'];

const ColumnsTitle = {
  pickup: 'Pickup Address',
  pickupCity: 'City',
  pickupZip: 'Zip Code',
  webstoreNames: 'Merchant',
  tripID: 'Trip / Order ID',
  weight: 'Weight',
  quantity: 'Quantity',
  action: 'Action',
  deadline: 'Deadline',
  checkbox: '',
  pickupType: 'Service Type',
};

const cityList = {};

/*
 * Get filter text from store
 *
*/
function getStoreFilterText(keyword, title) {
  return (store) => {
    const { filters } = store.app.pickupOrdersReady;
    return {
      value: filters[keyword],
      title,
    };
  };
}

/*
 * Dispatch filter text
 *
*/
function dispatchFilterText(keyword) {
  return (dispatch) => {
    function OnChange(e) {
      const newFilters = { [keyword]: e.target.value };
      dispatch(PickupOrdersReady.UpdateFilters(newFilters));
    }

    function OnKeyDown(e) {
      if (e.keyCode !== 13) {
        return;
      }

      dispatch(PickupOrdersReady.StoreSetter('currentPage', 1));
      dispatch(PickupOrdersReady.FetchList());
    }

    return {
      onChange: OnChange,
      onKeyDown: OnKeyDown,
    };
  };
}

/*
 * Connect store and dispatch for filter text
 *
*/
function connectFilterText(keyword, title) {
  return connect(getStoreFilterText(keyword, title), dispatchFilterText(keyword));
}

/*
 * Get filter dropdown from store
 *
*/
function getStoreFilterDropdown(name, title) {
  return (store) => {
    const { hubs, pickupOrdersReady } = store.app;
    const defaultOptions = [{
      key: 0, value: 'All',
    }];

    const listOptions = [{
      key: 0, value: 'All',
    }, {
      key: 1, value: 'Trip',
    }, {
      key: 2, value: 'Order',
    }];

    let hubOptions = [{
      key: 0,
      value: 'All',
      checked: false,
    }];

    const cityOptions = defaultOptions.concat(_.chain(cityList)
      .map((key, val) => ({ key, value: val }))
      .sortBy(arr => (arr.key))
      .value());

    if (hubs && hubs.list) {
      let options = [];
      options = _.chain(hubs.list)
        .map(hub => ({
          key: hub.HubID,
          value: `Hub ${hub.Name}`,
          checked: false,
        }))
        .sortBy(arr => arr.key)
        .value();

      hubOptions = [...hubOptions, ...options];

      if (pickupOrdersReady && pickupOrdersReady.hubIDs &&
        pickupOrdersReady.hubIDs.length > 0) {
        const ids = pickupOrdersReady.hubIDs;
        hubOptions = hubOptions.map((hub) => {
          const data = Object.assign({}, hub, {
            checked: _.some(ids, id => id === hub.key),
          });
          return data;
        });
      }
    }

    const options = {
      city: cityOptions,
      listType: listOptions,
      hubs: hubOptions,
      pickupType: defaultOptions.concat(config.PICKUP_TYPE),
    };

    return {
      value: store.app.pickupOrdersReady[name],
      options: options[name],
      title,
    };
  };
}

/*
 * Dispatch filter dropdown
 *
*/
function dispatchFilterDropdown(filterKeyword) {
  return (dispatch) => {
    const action = {
      handleSelect: (selectedOption) => {
        const SetFn = PickupOrdersReady.SetDropDownFilter(filterKeyword);
        dispatch(SetFn(selectedOption));
      },
    };
    return action;
  };
}

function dispatchFilterMultiDropdown(filterKeyword) {
  return (dispatch) => {
    const action = {
      handleSelect: (selectedOption) => {
        dispatch(selectedOption.checked ? PickupOrdersReady.addHubFilter(selectedOption) :
          PickupOrdersReady.deleteHubFilter(selectedOption));
        const SetFn = PickupOrdersReady.SetDropDownFilter(filterKeyword);
        dispatch(SetFn(selectedOption));
      },
      handleSelectAll: (options) => {
        dispatch(PickupOrdersReady.setAllHubFilter(options));
        const SetFn = PickupOrdersReady.SetDropDownFilter(filterKeyword);
        dispatch(SetFn());
      },
    };
    return action;
  };
}


/*
 * Connect store and dispatch for filter dropdown
 *
*/
function connectFilterDropdown(keyword, title) {
  return connect(getStoreFilterDropdown(keyword, title), dispatchFilterDropdown(keyword));
}

function connectFilterMultiDropdown(keyword, requestParam, title) {
  return connect(getStoreFilterDropdown(keyword, title), dispatchFilterMultiDropdown(requestParam));
}

const MerchantFilter = connectFilterText('merchant', 'Merchant')(FilterText);
const CityFilter = connectFilterDropdown('city', 'City')(FilterTop);
const TypeFilter = connectFilterDropdown('listType', 'Type')(FilterTop);
const ZipFilter = connectFilterText('zipCode', 'ZIP Code')(FilterText);
const HubFilter = connectFilterMultiDropdown('hubs', 'hubIDs', 'Hubs (can be multiple)')(FilterTopMultiple);
const ServiceTypeFilter = connectFilterDropdown('pickupType', 'ServiceType')(FilterTop);

/*
 * Dispatch for link cell
 *
*/
function mapDispatchToLink(dispatch, ownParams) {
  return {
    onClickModals: () => {
      dispatch(PickupOrdersReady.ShowDetails(parseInt(ownParams.item.tripID, 10)));
    },
    onClickDetails: () => {
      dispatch(push(`/trips/${parseInt(ownParams.item.tripID, 10)}/`));
    },
  };
}

/*
 * Dispatch for button cell
 *
*/
function mapDispatchToButton(dispatch, ownParams) {
  return {
    onClick: () => {
      dispatch(PickupOrdersReady.ShowAssignModal(parseInt(ownParams.item.tripID, 10)));
      dispatch(NearbyFleets.FetchList());
      dispatch(PickupOrdersReady.FetchDrivers(parseInt(ownParams.item.tripID, 10)));
      dispatch(PickupOrdersReady.fetchHubs());
    },
  };
}

const PickupOrdersID = connect(undefined, mapDispatchToLink)(IDCell);
const PickupOrdersButton = connect(undefined, mapDispatchToButton)(ButtonCell);

function AutoButtonGroup({ onClick, disabled }) {
  return (
    <button
      className={disabled ? styles.autoGroupButtonDisable : styles.autoGroupButton}
      disabled={disabled}
      onClick={onClick}
    >
      {disabled ? 'Auto Group On Progress' : 'Auto Group'}
    </button>
  );
}

/*
 * Dispatch for button auto group
 *
*/
function mapDispatchToAutoButtonGroup(dispatch, ownParams) {
  return {
    onClick: () => {
      dispatch(PickupOrdersReady.AutoGroup());
    },
  };
}

const AutoGroupButton = connect(undefined, mapDispatchToAutoButtonGroup)(AutoButtonGroup);

function ManualButtonGroup({ onClick, disabled, userLogged }) {
  const hasPermission = checkPermission(userLogged, 'GROUP_ORDERS');
  if (hasPermission) {
    return (
      <button
        className={disabled ? styles.manualGroupButtonDisable : styles.manualGroupButton}
        disabled={disabled}
        onClick={onClick}
      >
        Group Orders
    </button>
    );
  }
  return null;
}

/* eslint-disable */
ManualButtonGroup.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  userLogged: PropTypes.object.isRequired
};
/* eslint-enable */

/*
 * Dispatch for button manual group
 *
*/
function mapDispatchToManualButtonGroup(dispatch, ownParams) {
  return {
    onClick: () => {
      dispatch(PickupOrdersReady.GroupOrders());
    },
  };
}

function stateToManualButtonGroupProps(state) {
  const { userLogged } = state.app;

  return {
    userLogged,
  };
}

const ManualGroupButton = connect(stateToManualButtonGroupProps,
  mapDispatchToManualButtonGroup)(ManualButtonGroup);

function stateToCheckboxHeader(state) {
  const checkedAll = state.app.pickupOrdersReady.checkedAll;
  return {
    isChecked: checkedAll,
  };
}

/*
 * Dispatch for checkbox header
 *
*/
function mapDispatchToCheckBoxHeader(dispatch) {
  return {
    onToggle: () => {
      dispatch(PickupOrdersReady.ToggleSelectAll());
    },
  };
}

const PickupOrdersCheckBoxHeader = connect(
  stateToCheckboxHeader,
  mapDispatchToCheckBoxHeader,
)(CheckboxHeader);

/*
 * Dispatch for checkbox cell
 *
*/
function mapDispatchToCheckBox(dispatch, ownProps) {
  return {
    onToggle: () => {
      dispatch(PickupOrdersReady.ToggleSelectOne(parseInt(ownProps.item.tripID, 10)));
    },
  };
}

const PickupOrdersCheckBox = connect(undefined, mapDispatchToCheckBox)(CheckboxCell);

/*
 * Filter component
 *
*/
export const FilterReady = React.createClass({
  render() {
    const { isFetching } = this.props;
    const style = isFetching ? { opacity: 0.5 } : {};

    return (
      <div className={styles.filterTop}>
        <TypeFilter />
        <ServiceTypeFilter />
        <MerchantFilter />
        <CityFilter />
        <ZipFilter />
        {this.props.userLogged.roleName === config.role.SUPERHUB && <HubFilter />}
        <ManualGroupButton disabled={!this.props.isGroupActive} />
      </div>
    );
  },
});

const Table = React.createClass({
  render() {
    const Headers = _.map(ColumnsOrder, (columnKey) => {
      if (columnKey === 'checkbox') {
        return <PickupOrdersCheckBoxHeader key={columnKey} />;
      }

      return <th key={columnKey}>{ColumnsTitle[columnKey]}</th>;
    });

    const Body = _.map(this.props.items, (item) => {
      const cells = _.map(ColumnsOrder, (columnKey) => {
        if (columnKey === 'tripID') {
          if (item.isTrip) {
            return <td key={columnKey} className={tableStyles.td + ' ' + styles.tripColumn}><PickupOrdersID item={item} text={item[columnKey]} /></td>;
          }

          return (
            <td key={columnKey} className={tableStyles.td + ' ' + styles.tripColumn}>
              <Link to={`/orders/${item.key}`} className={styles.link}>{item['orderID']}</Link>
            </td>
          );
        }
        if (columnKey === 'weight') {
          return (
            <td key={columnKey} className={tableStyles.td}>{item[columnKey]} kg</td>
          );
        }
        if (columnKey === 'checkbox' && !item.isTrip) {
          return (
            <td key={columnKey} className={tableStyles.td}>
              <PickupOrdersCheckBox isChecked={item['IsChecked']} item={item} />
            </td>
          );
        }
        if (columnKey === 'action') {
          if (item.isTrip) {
            return <td key={columnKey} className={tableStyles.td}><PickupOrdersButton item={item} value={'Assign'} /></td>;
          }
          const buttonAction = {
            textBase: 'Assign',
            styles: {
              base: styles.cellButtonDisabled,
            },
            disabled: false,
          };
          return (
            <td key={columnKey} className={tableStyles.td}><ButtonStandard {...buttonAction} /></td>
          );
        }
        if (columnKey === 'deadline') {
          const format = {
            hour: 'hh',
            minute: 'mm',
            second: 'ss',
          };
          let Duration = moment.duration(moment(item[columnKey]).diff(moment(new Date())));
          if (Duration._milliseconds > config.deadline.day) {
            return (
              <td key={columnKey} className={tableStyles.td}>
                <span style={{ color: 'black' }}>
                  <span>
                    {Duration.humanize()}
                  </span>
                </span>
              </td>
            );
          } else if (Duration._milliseconds < 0) {
            return (
              <td key={columnKey} className={tableStyles.td}>
                <span style={{ color: 'red' }}>
                  <span>
                    Passed
                  </span>
                </span>
              </td>
            );
          }
          const normalDeadline = (Duration._milliseconds > config.deadline['3hours']) && (Duration._milliseconds < config.deadline.day);
          return (
            <td key={columnKey} className={tableStyles.td}>
              <span style={{ color: normalDeadline ? 'black' : 'red' }}>
                <span>
                  <Countdown
                    targetDate={new Date(item[columnKey])}
                    startDelay={500}
                    interval={1000}
                    format={format}
                    timeSeparator={':'}
                    leadingZero
                  />
                </span>
              </span>
            </td>
          );
        }
        return <td key={columnKey} className={tableStyles.td}>{item[columnKey]}</td>;
      });

      return <tr className={tableStyles.tr + ' ' + styles.noPointer} key={item.key}>{cells}</tr>;
    });

    if (this.props.isFetching) {
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20 }}>
            Fetching data....
          </div>
        </div>
      );
    } else {
      if (this.props.items.length === 0) {
        if (!_.isEmpty(this.props.filters)) {
          return (
            <table className={styles.table}>
              <thead><tr>{Headers}</tr></thead>
              <tbody className={styles.noOrder}>
                <tr>
                  <td colSpan={ColumnsOrder.length}>
                    <div className={styles.noOrderDesc}>
                      <img src="/img/image-ok-ready.png" />
                      <div style={{ fontSize: 20 }}>
                        Orders not found
                      </div>
                      <div style={{ fontSize: 12, marginTop: 20 }}>
                        Please choose another filter to get the orders.
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          );
        } else {
          return (
            <table className={styles.table}>
              <thead><tr>{Headers}</tr></thead>
              <tbody className={styles.noOrder}>
                <tr>
                  <td colSpan={ColumnsOrder.length}>
                    <div className={styles.noOrderDesc}>
                      <img src="/img/image-ok-ready.png" />
                      <div style={{ fontSize: 20 }}>
                        You have assigned all orders!
                      </div>
                      <div style={{ fontSize: 12, marginTop: 20 }}>
                        Please open the Inbound Menu to see the the pickup status .
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          );
        }
      } else {
        return (
          <table className={styles.table}>
            <thead><tr>{Headers}</tr></thead>
            <tbody>{Body}</tbody>
          </table>
        );
      }
    }
  },
});

function ProcessTrip(trip) {
  if (trip.TripID) {
    const parsedTrip = TripParser(trip);
    const fleet = trip.FleetManager && fleetList[trip.FleetManager.UserID];
    const fleetName = fleet && fleet.CompanyDetail && fleet.CompanyDetail.CompanyName;

    return {
      key: trip.TripID,
      pickup: trip.PickupAddress && trip.PickupAddress.Address1,
      pickupCity: trip.PickupAddress && trip.PickupAddress.City,
      pickupZip: trip.PickupAddress && trip.PickupAddress.ZipCode,
      webstoreNames: parsedTrip.WebstoreNames,
      quantity: parsedTrip.orders.length,
      tripID: `${trip.TripID}`,
      weight: parseFloat(parsedTrip.Weight).toFixed(2),
      isTrip: true,
      deadline: trip.Deadline,
      IsChecked: trip.IsChecked,
      pickupType: parsedTrip.PickupType,
    };
  }

  return {
    key: trip.UserOrderID,
    pickup: trip.PickupAddress && trip.PickupAddress.Address1,
    pickupCity: trip.PickupAddress && trip.PickupAddress.City,
    pickupZip: trip.PickupAddress && trip.PickupAddress.ZipCode,
    quantity: 1,
    webstoreNames: trip.User && `${trip.User.FirstName} ${trip.User.LastName}`,
    tripID: `${trip.UserOrderID}`,
    weight: parseFloat(trip.PackageWeight).toFixed(2),
    isTrip: false,
    deadline: trip.Deadline,
    IsChecked: trip.IsChecked,
    orderID: `${trip.UserOrderNumber} (${trip.WebOrderID})`,
    pickupType: pickupType(trip.PickupType),
  };
}

function OrderList({ orders }) {
  const orderComponents = orders.map((order) => {
    const elem = (
      <div key={order.UserOrderNumber} className={styles.modalOrderMain}>
        <table>
          <tr>
            <td className={styles.modalOrderID}>
              {order.UserOrderNumber}
            </td>
          </tr>
          <tr>
            <td className={styles.modalOrderWeight}>
              Weight: {order.PackageWeight} kg
            </td>
          </tr>
        </table>
      </div>
    );

    return elem;
  });
  return <div>{orderComponents}</div>;
}

/* eslint-disable */
OrderList.propTypes = {
  orders: PropTypes.any.isRequired,
};
/* eslint-enable */

const TableStateful = React.createClass({
  componentWillUnmount() {
    this.props.resetFilter();
  },
  closeModal() {
    this.props.CloseModal();
  },
  render() {
    const { filters, paginationAction, paginationState, statusParams, tripDetails, tripsIsFetching } = this.props;

    const paginationProps = _.assign({}, paginationAction, paginationState);

    const filteringAction = {
      changeFilter: this.changeFilter,
      changeFilterAndFetch: this.changeFilterAndFetch,
      fetchTrips: this.fetchTrips,
    };

    const trips = _.map(this.props.trips, ProcessTrip);
    const tableProps = {
      items: trips,
      toDetails: tripDetails,
      filters,
      isFetching: tripsIsFetching,
      showModals: this.props.showModals,
    };

    return (
      <div>
        <div style={{ opacity: tripsIsFetching ? 0.5 : 1 }}>
          <Table {...tableProps} />
          <Pagination {...paginationProps} />
        </div>
        <PickupOrdersModal />
        {
          this.props.showDetails &&
          <ModalContainer>
            <ModalDialog>
              <div>
                <div className={styles.modalTitle}>
                  TRIP-{this.props.trip.TripID}
                </div>
                <div
                  role="button"
                  onClick={this.closeModal}
                  className={styles.modalClose}
                >
                  &times;
                </div>
                <div className={styles.topDescDetails}>
                  <div className={styles.modalDescDetails}>
                    <p className={styles.mainLabelDetails}>
                      From {this.props.trip.ListWebstoreMores}
                    </p>
                    <p className={styles.secondLabelDetails}>
                      {this.props.trip.orders.length} items
                    </p>
                  </div>
                  <div className={styles.modalDesc2Details}>
                    <p className={styles.secondLabelDetails}>
                      Total Weight
                    </p>
                    <p className={styles.weightLabelDetails}>
                      {this.props.trip.Weight}
                      <span className={styles.unitWeightLabelDetails}> kg</span>
                    </p>
                  </div>
                  <div style={{ clear: 'both' }} />
                </div>
                <div className={styles.orderList}>
                  <OrderList orders={this.props.trip.orders} />
                </div>
              </div>
            </ModalDialog>
          </ModalContainer>
        }
      </div>
    );
  },
});

function StateToProps(state) {
  const { pickupOrdersReady } = state.app;
  const { isFetching, limit, total, currentPage, trips, tripActive, filters,
    showDetails } = pickupOrdersReady;

  const { cities } = state.app.cityList;

  cities.forEach((city) => {
    cityList[city.Name] = city.CityID;
  });

  const paginationState = {
    currentPage,
    limit,
    total,
  };

  const statusList = state.app.containers.statusList;
  const trip = TripParser(tripActive);

  return {
    paginationState,
    trips,
    tripsIsFetching: isFetching,
    statusList: _.chain(statusList)
      .map((key, val) => [val, key])
      .sortBy(arr => (arr[1]))
      .map(arr => (arr[0]))
      .value(),
    nameToID: _.reduce(statusList, (memo, key, val) => {
      memo[val] = key;
      return memo;
    }, {}),
    filters,
    trip,
    showDetails,
  };
}

function DispatchToProps(dispatch) {
  return {
    initialLoad() {
      dispatch(PickupOrdersReady.FetchList());
    },
    changeFilter: (filters) => {
      dispatch(PickupOrdersReady.AddFilters(filters));
    },
    paginationAction: {
      setCurrentPage(pageNum) {
        dispatch(PickupOrdersReady.SetCurrentPage(pageNum));
      },
      setLimit(limit) {
        dispatch(PickupOrdersReady.SetLimit(limit));
      },
    },
    tripDetails(id) {
      dispatch(push(`/trips/${id}/`));
    },
    CloseModal() {
      dispatch(PickupOrdersReady.HideAssignModal());
      dispatch(PickupOrdersReady.HideDetails());
      dispatch(NearbyFleets.ResetVendorList());
    },
    resetFilter() {
      dispatch(PickupOrdersReady.ResetFilter());
    },
  };
}

export default connect(StateToProps, DispatchToProps)(TableStateful);
