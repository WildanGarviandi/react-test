import * as _ from 'lodash'; //eslint-disable-line
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import * as PickupOrdersReady from './pickupOrdersReadyService';
import * as NearbyFleets from '../nearbyFleets/nearbyFleetService';
import { DropdownTypeAhead, Input, Pagination, ButtonStandard } from '../views/base';
import DateRangePicker from '../views/base/dateRangePicker';
import tableStyles from '../views/base/table.css';
import StatusDropdown from '../views/base/statusDropdown';
import { TripParser } from '../modules/trips';
import { OrderParser } from '../modules/orders';
import { formatDate } from '../helper/time';
import { modalAction } from '../modules/modals/constants';
import stylesModal from '../views/base/modal.css';
import classnaming from 'classnames';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';
import styles from './styles.css';
import BodyRow, { CheckBoxCell, LinkCell, TextCell, OrderIDLinkCell, ButtonCell, IDCell } from '../views/base/cells';
import { CheckboxHeader, CheckboxCell } from '../views/base/tableCell';
import { FilterTop, FilterText, FilterTopMultiple } from '../components/form';
import * as TripDetails from '../modules/inboundTripDetails';
import config from '../config/configValues.json';
import Countdown from 'react-cntdwn';
import PickupOrdersModal from './pickupOrdersModal';
import { Link } from 'react-router';

const ColumnsOrder = ['checkbox', 'tripID', 'webstoreNames', 'weight', 'quantity', 'pickup', 'pickupCity', 'pickupZip', 'deadline', 'action'];

const ColumnsTitle = {
  pickup: "Pickup Address",
  pickupCity: "City",
  pickupZip: "Zip Code",
  webstoreNames: "Merchant",
  tripID: "Trip / Order ID",
  weight: "Weight",
  quantity: "Quantity",
  action: "Action",
  deadline: "Deadline",
  checkbox: ''
}

let cityList = {};

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

      dispatch(PickupOrdersReady.StoreSetter("currentPage", 1));
      dispatch(PickupOrdersReady.FetchList());
    }

    return {
      onChange: OnChange,
      onKeyDown: OnKeyDown,
    }
  }
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
    let cityOptions = [{
      key: 0, value: 'All',
    }];

    const listOptions = [{
      key: 0, value: 'All',
    }, {
      key: 1, value: 'Trip',
    }, {
      key: 2, value: 'Order',
    }];

    let hubOptions = [];

    cityOptions = cityOptions.concat(_.chain(cityList)
      .map((key, val) => ({ key, value: val }))
      .sortBy(arr => (arr.key))
      .value());

    if (hubs && hubs.list) {
      hubOptions = _.chain(hubs.list)
        .map(hub => ({
          key: hub.HubID,
          value: `Hub ${hub.Name}`,
          checked: false,
        }))
        .sortBy(arr => arr.key)
        .value();

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

/*
 * Dispatch for link cell
 *
*/
function mapDispatchToLink(dispatch, ownParams) {
  return {
    onClickModals: function () {
      dispatch(PickupOrdersReady.ShowDetails(parseInt(ownParams.item.tripID)));
    },
    onClickDetails: function () {
      dispatch(push(`/trips/${parseInt(ownParams.item.tripID)}/`));
    }
  }
}

/*
 * Dispatch for button cell
 *
*/
function mapDispatchToButton(dispatch, ownParams) {
  return {
    onClick: function () {
      dispatch(PickupOrdersReady.ShowAssignModal(parseInt(ownParams.item.tripID)));
      dispatch(NearbyFleets.FetchList());
      dispatch(PickupOrdersReady.FetchDrivers(parseInt(ownParams.item.tripID)));
    }
  }
}

const PickupOrdersID = connect(undefined, mapDispatchToLink)(IDCell);
const PickupOrdersButton = connect(undefined, mapDispatchToButton)(ButtonCell);

function AutoButtonGroup({ onClick, disabled }) {
  return (
    <button className={disabled ? styles.autoGroupButtonDisable : styles.autoGroupButton} disabled={disabled} onClick={onClick}>
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
    onClick: function () {
      dispatch(PickupOrdersReady.AutoGroup());
    }
  }
}

const AutoGroupButton = connect(undefined, mapDispatchToAutoButtonGroup)(AutoButtonGroup);

function ManualButtonGroup({ onClick, disabled }) {
  return (
    <button className={disabled ? styles.manualGroupButtonDisable : styles.manualGroupButton} disabled={disabled} onClick={onClick}>
      Group Orders
    </button>
  );
}

/*
 * Dispatch for button manual group
 *
*/
function mapDispatchToManualButtonGroup(dispatch, ownParams) {
  return {
    onClick: function () {
      dispatch(PickupOrdersReady.GroupOrders());
    }
  }
}

const ManualGroupButton = connect(undefined, mapDispatchToManualButtonGroup)(ManualButtonGroup);

function stateToCheckboxHeader(state) {
  const checkedAll = state.app.pickupOrdersReady.checkedAll;
  return {
    isChecked: checkedAll,
  }
}

/*
 * Dispatch for checkbox header
 *
*/
function mapDispatchToCheckBoxHeader(dispatch) {
  return {
    onToggle: function () {
      dispatch(PickupOrdersReady.ToggleSelectAll());
    }
  }
}

const PickupOrdersCheckBoxHeader = connect(stateToCheckboxHeader, mapDispatchToCheckBoxHeader)(CheckboxHeader);

/*
 * Dispatch for checkbox cell
 *
*/
function mapDispatchToCheckBox(dispatch, ownProps) {
  return {
    onToggle: function (val) {
      dispatch(PickupOrdersReady.ToggleSelectOne(parseInt(ownProps.item.tripID)));
    }
  }
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
        <MerchantFilter />
        <CityFilter />
        <ZipFilter />
        { this.props.userLogged.roleName === config.role.SUPERHUB && <HubFilter /> }
        <ManualGroupButton disabled={!this.props.isGroupActive} />
      </div>
    );
  }
})

const Table = React.createClass({
  render() {
    const Headers = _.map(ColumnsOrder, (columnKey) => {
      if (columnKey === 'checkbox') {
        return <PickupOrdersCheckBoxHeader key={columnKey} />;
      } else {
        return <th key={columnKey}>{ColumnsTitle[columnKey]}</th>;
      }
    });

    const Body = _.map(this.props.items, (item) => {
      const cells = _.map(ColumnsOrder, (columnKey) => {
        if (columnKey === 'tripID') {
          if (item.isTrip) {
            return <td key={columnKey} className={tableStyles.td + ' ' + styles.tripColumn}><PickupOrdersID item={item} text={item[columnKey]} /></td>;
          } else {
            return <td key={columnKey} className={tableStyles.td + ' ' + styles.tripColumn}>
              <Link to={`/orders/${item.key}`} className={styles.link}>{item['orderID']}</Link>
            </td>;
          }
        }
        if (columnKey === 'weight') {
          return <td key={columnKey} className={tableStyles.td} key={columnKey}>{item[columnKey]} kg</td>;
        }
        if (columnKey === 'checkbox' && !item.isTrip) {
          return <td key={columnKey} className={tableStyles.td} key={columnKey}>
            <PickupOrdersCheckBox isChecked={item['IsChecked']} item={item} />
          </td>;
        }
        if (columnKey === 'action') {
          if (item.isTrip) {
            return <td key={columnKey} className={tableStyles.td}><PickupOrdersButton item={item} value={'Assign'} /></td>
          } else {
            const buttonAction = {
              textBase: 'Assign',
              styles: {
                base: styles.cellButtonDisabled
              },
              disabled: true
            }
            return <td key={columnKey} className={tableStyles.td}><ButtonStandard {...buttonAction} /></td>;
          }
        }
        if (columnKey === 'deadline') {
          let format = {
            hour: 'hh',
            minute: 'mm',
            second: 'ss'
          };
          let Duration = moment.duration(moment(item[columnKey]).diff(moment(new Date())));
          if (Duration._milliseconds > config.deadline.day) {
            return <td key={columnKey} className={tableStyles.td} key={columnKey}>
              <span style={{ color: 'black' }}>
                <span>
                  {Duration.humanize()}
                </span>
              </span>
            </td>
          } else if (Duration._milliseconds < 0) {
            return <td key={columnKey} className={tableStyles.td} key={columnKey}>
              <span style={{ color: 'red' }}>
                <span>
                  Passed
                </span>
              </span>
            </td>
          } else {
            let normalDeadline = (Duration._milliseconds > config.deadline['3hours']) && (Duration._milliseconds < config.deadline.day);
            return <td key={columnKey} className={tableStyles.td} key={columnKey}>
              <span style={{ color: normalDeadline ? 'black' : 'red' }}>
                <span>
                  <Countdown targetDate={new Date(item[columnKey])}
                    startDelay={500}
                    interval={1000}
                    format={format}
                    timeSeparator={':'}
                    leadingZero={true} />
                </span>
              </span>
            </td>
          }
        }
        return <td key={columnKey} className={tableStyles.td} key={columnKey}>{item[columnKey]}</td>;
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
  }
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
      quantity: trip.UserOrderRoutes.length,
      tripID: `${trip.TripID}`,
      weight: parseFloat(parsedTrip.Weight).toFixed(2),
      isTrip: true,
      deadline: trip.Deadline,
      IsChecked: trip.IsChecked
    }
  } else {
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
      orderID: `${trip.UserOrderNumber} (${trip.WebOrderID})`
    }
  }
}

const OrderList = React.createClass({
  render: function () {
    var orderComponents = this.props.routes.map(function (route, idx) {
      return (
        <div key={idx} className={styles.modalOrderMain}>
          <table>
            <tr>
              <td className={styles.modalOrderID}>
                {route.UserOrder.UserOrderNumber}
              </td>
            </tr>
            <tr>
              <td className={styles.modalOrderWeight}>
                Weight: {route.UserOrder.PackageWeight} kg
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
    }

    const trips = _.map(this.props.trips, ProcessTrip);
    const tableProps = {
      items: trips,
      toDetails: tripDetails,
      filters: filters,
      isFetching: tripsIsFetching,
      showModals: this.props.showModals
    }

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
                <div onClick={this.closeModal} className={styles.modalClose}>
                  X
                </div>
                <div className={styles.topDescDetails}>
                  <div className={styles.modalDescDetails}>
                    <p className={styles.mainLabelDetails}>
                      From {this.props.trip.ListWebstoreMores}
                    </p>
                    <p className={styles.secondLabelDetails}>
                      {this.props.trip.UserOrderRoutes.length} items
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
                  <OrderList routes={this.props.trip.UserOrderRoutes} />
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
  const { pickupOrdersReady } = state.app;
  const { isFetching, limit, total, currentPage, trips, tripActive, filters,
    showDetails } = pickupOrdersReady;

  const { cities } = state.app.cityList;

  cities.forEach(function (city) {
    cityList[city.Name] = city.CityID;
  });

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
    trip,
    showDetails,
  };
}

function DispatchToProps(dispatch, ownProps) {
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
