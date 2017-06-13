import lodash from 'lodash'; // eslint-disable-line
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import * as OutboundTrips from './outboundTripsService';
import { Input, Pagination } from '../views/base';
import { DropdownWithState2 } from '../views/base/dropdown';
import tableStyles from '../views/base/table.css';
import styles from './styles.css';
import { Glyph } from '../views/base/glyph';
import StatusDropdown from '../views/base/statusDropdown';
import { Interval } from './outboundTripsModal';
import { ProcessTrip } from './outboundTripsHelper';
import config from '../config/configValues.json';

const vehicles = {};
lodash.each(config.vehicle, (vehicle) => {
  vehicles[vehicle.value.toUpperCase()] = vehicle.key;
});

const ColumnsOrder = ['tripID', 'nextDestination', 'tripType', 'fleet',
  'status', 'nextSuggestion', 'numberPackages', 'weight', 'remarks', 'deadline', 'actions'];

const ColumnsTitle = {
  containerNumber: 'Container',
  district: 'District',
  tripID: 'Trip ID',
  fleet: 'Assigned To',
  driver: 'Driver',
  nextDestination: 'Destination',
  dropoffTime: 'Dropoff Time',
  pickup: 'Pickup Address',
  pickupTime: 'Pickup Time',
  status: 'Status',
  tripNumber: 'Trip Number',
  tripType: 'Type',
  webstoreNames: 'Webstore',
  numberPackages: 'Qty',
  nextSuggestion: 'Suggested Destination',
  weight: 'Weight',
  remarks: 'Remarks',
  deadline: 'Deadline',
  actions: 'Action',
};

function FindFilter(filters, attr) {
  switch (attr) {
    case 'fleetName':
      return filters.fleet;

    case 'webstoreNames':
      return filters.merchant;

    default:
      return filters[attr];
  }
}

const SearchCell = React.createClass({
  render() {
    return (
      <Input styles={{ input: tableStyles.searchInput }} onChange={this.props.onChange} onEnterKeyPressed={this.props.onEnterKeyPressed} base={{ value: this.props.filter, type: 'text' }} />
    );
  },
});

function StateToStatus(state) {
  const statusName = state.app.outboundTripsService.filtersStatus;
  return {
    val: statusName,
  };
}

function SelectDispatch(dispatch) {
  return {
    handleSelect: (val) => {
      dispatch(OutboundTrips.SetFiltersStatus(val.value));
    },
  };
}

const TrueSelect = connect(StateToStatus, SelectDispatch)(StatusDropdown);

const TripTypeDropDown = React.createClass({
  handleSelect(val) {
    this.props.setType(val.key);
  },
  render() {
    const options = [
      { key: 0, value: 'All' },
      { key: 1, value: 'Last Mile' },
      { key: 2, value: 'Hub' },
      { key: 3, value: 'No Destination Yet' },
    ];
    const val = options[this.props.val].value;

    return (
      <DropdownWithState2 val={val} options={options} handleSelect={this.handleSelect} />
    );
  },
});

function TripTypeDropDownDispatch(dispatch) {
  return {
    setType: (type) => {
      dispatch(OutboundTrips.AddFilters({ tripType: type }));
    },
  };
}

function TripTypeDropDownState(state) {
  return {
    val: state.app.outboundTripsService.filters.tripType,
  };
}

const TripTypeDropDownWithState = connect(
  TripTypeDropDownState,
  TripTypeDropDownDispatch,
)(TripTypeDropDown);

const TripStatusSelect = React.createClass({
  selectVal(val) {
    this.props.pickStatus(val);
  },
  render() {
    return (
      <TrueSelect />
    );
  },
});

const Table = React.createClass({
  render() {
    const Headers = lodash.map(ColumnsOrder, (columnKey) => {
      switch (columnKey) {
        case 'tripID': {
          return <th key={columnKey} className={styles.thTripID}>{ColumnsTitle[columnKey]}</th>;
        }

        case 'fleet': {
          return <th key={columnKey} className={styles.thAssignedTo}>{ColumnsTitle[columnKey]}</th>;
        }

        case 'actions': {
          return <th key={columnKey} className={styles.thActions}>{ColumnsTitle[columnKey]}</th>;
        }

        default: {
          return <th key={columnKey}>{ColumnsTitle[columnKey]}</th>;
        }
      }
    });

    const Body = lodash.map(this.props.items, (item) => {
      const cells = lodash.map(ColumnsOrder, (columnKey) => {
        switch (columnKey) {
          case 'tripID': {
            return <td className={`${tableStyles.td} ${styles.clickable}`} key={columnKey} onClick={this.props.toDetails.bind(null, item.key)}>{item[columnKey]}</td>;
          }

          case 'fleet': {
            let vehicleLogoSrc = '';
            if (item.driver) {
              vehicleLogoSrc = (item.vehicleID === vehicles.MOTORCYCLE) ?
              config.IMAGES.MOTORCYCLE : config.IMAGES.VAN;
            }
            const itemWith3PL = (
              <p>
                <b>{item.fleet.thirdPartyLogistic}</b>
                <br />
                {item.fleet.awbNumber}
              </p>
            );
            const itemNot3PL = (
              <span className={styles.tripWithDriverCell}>
                { item.driver &&
                  <img src={vehicleLogoSrc} className={styles.vehicleLogoOnTable} />
                }
                <p>
                  <b>{item.fleet.companyName}</b>
                  <br />
                  {item.fleet.driverDetail}
                </p>
              </span>
            );
            const textValue = (item.fleet.thirdPartyLogistic) ? itemWith3PL : itemNot3PL;

            if (!item.isAssigned) {
              return (
                <td className={tableStyles.td} key={columnKey}>-</td>
              );
            }

            return (
              <td className={tableStyles.td} key={columnKey}>{textValue}</td>
            );
          }

          case 'weight': {
            return (
              <td className={tableStyles.td} key={columnKey}>
                {parseFloat(item.weight).toFixed(2)} Kg
              </td>
            );
          }

          case 'actions': {
            const btnPrint = (
              <div className={styles.btnPrintOnTable}>
                <a href={`/trips/'${item.actions}/manifest#`} className="btn btn-sm btn-default" target="_blank" rel="noopener noreferrer">
                  <Glyph name={'print'} />
                </a>
              </div>
            );
            const btnAssign = (
              <div className={styles.btnAssignOnTable}>
                <button
                  className={`${styles.btnAssign} btn btn-sm btn-success`}
                  disabled={item.isActionDisabled}
                  onClick={this.props.openModal.bind(null, item)}
                >
                  Assign
                </button>
              </div>
            );
            const btnAction = <div className="nb">{btnPrint}{btnAssign}</div>;
            return <td className={tableStyles.td} key={columnKey}>{btnAction}</td>;
          }

          case 'deadline': {
            const deadlineDiff = item.deadline.diff(moment());
            const itemComponent = (deadlineDiff > 0) ?
              <Interval startTime={deadlineDiff} down={true} />
              : <span>{item.deadline.fromNow()}</span>;

            return (
              <td
                className={tableStyles.td + ((deadlineDiff > 0) ? '' : ` ${styles.redColumn}`)}
                key={columnKey}
              >
                {itemComponent}
              </td>
            );
          }

          case 'nextSuggestion': {
            const suggestionComponents = item.nextSuggestion.map((suggestion, idx) => {
              return (
                <li key={idx}>{suggestion}</li>
              );
            });

            return (
              <td className={tableStyles.td} key={columnKey}>
                <ul>{suggestionComponents}</ul>
              </td>
            );
          }

          default: {
            return <td className={tableStyles.td} key={columnKey}>{item[columnKey]}</td>;
          }
        }
      });

      return <tr className={styles.tr} key={item.key}>{cells}</tr>;
    });

    const changeFilter = this.props.filteringAction.changeFilter;
    const Filters = lodash.map(ColumnsOrder, (columnKey) => {
      switch (columnKey) {
        case 'tripID': {
          return (
            <div key={columnKey} className={`${styles.colMd3} ${styles.filterDropDown}`}>
              <span className={styles.title}>{ColumnsTitle[columnKey]}</span>
              <SearchCell
                key={columnKey}
                attr={columnKey}
                onChange={changeFilter.bind(null, columnKey)}
                onEnterKeyPressed={this.props.filteringAction.fetchTrips}
                filter={FindFilter(this.props.filters, columnKey)}
              />
            </div>
          );
        }

        case 'nextDestination': {
          return (
            <div key={columnKey} className={`${styles.colMd3} ${styles.filterDropDown}`}>
              <span className={styles.title}>{ColumnsTitle[columnKey]}</span>
              <SearchCell
                key={columnKey}
                attr={columnKey}
                onChange={changeFilter.bind(null, columnKey)}
                onEnterKeyPressed={this.props.filteringAction.fetchTrips}
                filter={FindFilter(this.props.filters, columnKey)}
              />
            </div>
          );
        }

        case 'tripType': {
          return (
            <div key={columnKey} className={`${styles.colMd3} ${styles.filterDropDown}`}>
              <span>{ColumnsTitle[columnKey]}</span>
              <TripTypeDropDownWithState />
            </div>
          );
        }

        case 'status': {
          return (
            <div key={columnKey} className={`${styles.colMd3} ${styles.filterDropDown}`}>
              <span>{ColumnsTitle[columnKey]}</span>
              <TripStatusSelect {...this.props.statusProps} />
            </div>
          );
        }

        default:
          return null;
      }
    });

    const Search = (
      <div className="row">
        {Filters}
      </div>
    );

    return (
      <div>
        {Search}
        <table className={tableStyles.table}>
          <thead><tr>{Headers}</tr></thead>
          { this.props.isFetching &&
            <tbody>
              <td colSpan={ColumnsOrder.length}>
                <div className={styles.fetchingText}>
                  Fetching data....
                </div>
              </td>
            </tbody>
          }
          { !this.props.isFetching && this.props.items.length > 0 &&
            <tbody>{Body}</tbody>
          }
          { !this.props.isFetching && this.props.items.length === 0 &&
            <tbody>
              <td colSpan={ColumnsOrder.length}>
                <div className={styles.emptyTableContainer}>
                  <img src="/img/image-all-assigned.png" className={styles.emptyTableImage} />
                  <div className={styles.bigText}>
                    There are no active outbound trips
                  </div>
                </div>
              </td>
            </tbody>
          }
        </table>
      </div>
    );
  },
});

const TableStateful = React.createClass({
  componentWillMount() {
    this.props.initialLoad();
  },
  getInitialState() {
    return this.props.filters;
  },
  fetchTrips() {
    this.props.changeFilter(this.state);
  },
  pickStatus(val) {
    this.setState({
      statusName: val, status: this.props.nameToID[val],
    }, () => {
      this.fetchTrips();
    });
  },
  changeFilter(attr, val) {
    let attrName;
    switch (attr) {
      case 'fleetName':
        attrName = 'fleet';
        break;

      case 'webstoreNames':
        attrName = 'merchant';
        break;

      default:
        attrName = attr;
    }

    this.setState({ [attrName]: val });
  },
  changeFilterAndFetch(filters) {
    this.setState(filters, () => {
      this.fetchTrips();
    });
  },
  openModal(item) {
    this.props.fetchListOnModal(item.key);
  },
  render() {
    const {
      filters,
      paginationAction,
      paginationState,
      statusParams,
      tripDetails,
      tripsIsFetching,
    } = this.props;

    const paginationProps = lodash.assign({}, paginationAction, paginationState);

    const statusProps = {
      pickStatus: this.pickStatus,
      statusList: this.props.statusList,
      statusName: this.state.statusName,
    };

    const filteringAction = {
      changeFilter: this.changeFilter,
      changeFilterAndFetch: this.changeFilterAndFetch,
      fetchTrips: this.fetchTrips,
    };

    const trips = lodash.map(this.props.trips, ProcessTrip);

    const tableProps = {
      items: trips,
      toDetails: tripDetails,
      filteringAction,
      statusProps,
      filters: this.state,
      isFetching: tripsIsFetching,
      openModal: this.openModal,
    };

    return (
      <div>
        <div style={{ opacity: tripsIsFetching ? 0.5 : 1 }}>
          <Table {...tableProps} />
          <Pagination {...paginationProps} />
        </div>
      </div>
    );
  },
});

function StateToProps(state) {
  const { outboundTripsService } = state.app;
  const { isFetching, limit, total, currentPage, trips, filters } = outboundTripsService;

  const paginationState = {
    currentPage,
    limit,
    total,
  };

  const statusList = state.app.containers.statusList;

  return {
    paginationState,
    trips,
    tripsIsFetching: isFetching,
    statusList: lodash.chain(statusList).map((key, val) => [val, key])
      .sortBy(arr => (arr[1])).map(arr => (arr[0]))
      .value(),
    nameToID: lodash.reduce(statusList, (memo, key, val) => {
      memo[val] = key;
      return memo;
    }, {}),
    filters,
  };
}

function DispatchToProps(dispatch, ownProps) {
  return {
    initialLoad() {
      dispatch(OutboundTrips.FetchList());
    },
    paginationAction: {
      setCurrentPage(pageNum) {
        dispatch(OutboundTrips.SetCurrentPage(pageNum));
      },
      setLimit(limit) {
        dispatch(OutboundTrips.SetLimit(limit));
      },
    },
    fetchListOnModal: (tripID) => {
      dispatch(OutboundTrips.FetchListNearbyDrivers(tripID));
      dispatch(OutboundTrips.FetchDetails(tripID));
      dispatch(OutboundTrips.FetchListNearbyFleets());
    },
    changeFilter: (filters) => {
      dispatch(OutboundTrips.AddFilters(filters));
    },
    tripDetails(id) {
      dispatch(push(`/trips/${id}`));
    },
  };
}

export default connect(StateToProps, DispatchToProps)(TableStateful);
