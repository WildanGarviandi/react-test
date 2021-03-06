import lodash from 'lodash';
import ClassName from 'classnames';
import moment from 'moment';
import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import * as OutboundTrips from '../../modules/trips/actions/outbound';
import * as InboundTrips from '../../modules/inboundTrips';
import {DropdownTypeAhead, Input, Pagination} from '../base';
import DateRangePicker from '../base/dateRangePicker';
import tableStyles from '../base/table.scss';
import StatusDropdown from '../base/statusDropdown';
import {TripParser} from '../../modules/trips';
import {formatDate} from '../../helper/time';
import {modalAction} from '../../modules/modals/constants';
import stylesModal from '../base/modal.scss';
import classnaming from 'classnames';

const ColumnsOrder = ['fleetName', 'driver', 'webstoreNames', 'pickup', 'pickupCity', 'pickupState', 'containerNumber', 'status', 'numberPackages', 'remarks'];

const ColumnsTitle = {
  containerNumber: "Container",
  district: "District",
  driver: "Driver",
  dropoff: "Next Destination",
  dropoffTime: "Dropoff Time",
  fleetName: "Fleet",
  pickup: "Pickup Address",
  pickupCity: "City",
  pickupState: "State",
  pickupTime: "Pickup Time",
  status: "Status",
  tripNumber: "Trip Number",
  webstoreNames: "Webstore",
  numberPackages: "Number of Packages",
  remarks: "Remarks"
}

let fleetList = {};

function FindFilter(filters, attr) {
  switch(attr) {
    case 'fleetName':
      return filters['fleet'];

    case 'webstoreNames':
      return filters['merchant'];

    default:
      return filters[attr];
  }
}

const SearchCell = React.createClass({
  render() {
    return (
      <td className={ClassName(tableStyles.td, tableStyles.search)}>
        <Input styles={{input: tableStyles.searchInput}} base={{type:"text"}} onChange={this.props.onChange} onEnterKeyPressed={this.props.onEnterKeyPressed} base={{value: this.props.filter}} />
      </td>
    );
  }
});

const DateCell = React.createClass({
  getInitialState() {
    return {showDate: false, txt: ''};
  },
  showPicker() {
    this.setState({showDate: true});
  },
  hidePicker() {
    this.setState({showDate: false});
  },
  handleSelect(range) {
    const attr = this.props.attr;
    const filters = {
      ['start'+attr]: range.start.format(),
      ['end'+attr]: range.end.format(),
    };

    this.props.changeFilter(filters);
    this.setState({txt: `${range.start.format('DD/MM/YYYY')}-${range.end.format('DD/MM/YYYY')}`});
  },
  handleChange(e) {
    this.setState({txt: e.target.value});
  },
  handleKeyDown(e) {
    if (e.keyCode === 13) {
      const attr = this.props.attr;
      const range = _.map(this.state.txt.split('-'), (s) => (s.split('/')));

      let filters;
      if (range.length !== 2) {
        filters = {
          ['start'+attr]: '',
          ['end'+attr]: '',
        }
      } else {
        const [startDate, endDate] = _.map(range, (date) => {
          return moment(date.join(''), "DDMMYYYY");
        });

        filters = {
          ['start'+attr]: startDate.format(),
          ['end'+attr]: endDate.format(),
        }
      }

      this.setState({showDate: false});
      this.props.changeFilter(filters);
    }
  },
  render() {
    return (
      <td>
        <input value={this.state.txt} className={tableStyles.searchInput} type="text" onFocus={this.showPicker} onChange={this.handleChange} onKeyDown={this.handleKeyDown} />
        <DateRangePicker show={this.state.showDate} hidePicker={this.hidePicker} selectRange={this.handleSelect} />
      </td>
    );
  }
});

function StateToStatus(state) {
  const statusName = state.app.inboundTrips.filtersStatus;
  return {
    val: statusName,
  }
}

function SelectDispatch(dispatch) {
  return {
    handleSelect: (val) => {
      dispatch(InboundTrips.SetFiltersStatus(val.value));
    }
  }
}

const TrueSelect = connect(StateToStatus, SelectDispatch)(StatusDropdown);

const TripStatusSelect = React.createClass({
  selectVal(val) {
    this.props.pickStatus(val);
  },
  render() {
    const {statusList, statusName} = this.props;
    return (
      <td className={ClassName(tableStyles.td, tableStyles.search)} style={{width: 150}}>
        <TrueSelect />
      </td>
    );
  }
});

const Table = React.createClass({
  render() {
    const Headers = _.map(ColumnsOrder, (columnKey) => {
      return <th key={columnKey}>{ColumnsTitle[columnKey]}</th>;
    });

    const Body = _.map(this.props.items, (item) => {
      const cells = _.map(ColumnsOrder, (columnKey) => {
        return <td className={tableStyles.td} key={columnKey}>{item[columnKey]}</td>;
      });

      return <tr className={tableStyles.tr} key={item.key} onClick={this.props.toDetails.bind(null, item.key)}>{cells}</tr>;
    });

    const changeFilter = this.props.filteringAction.changeFilter;
    const Filters = _.map(ColumnsOrder, (columnKey) => {
      return <SearchCell key={columnKey} attr={columnKey} onChange={changeFilter.bind(null, columnKey)} onEnterKeyPressed={this.props.filteringAction.fetchTrips} filter={FindFilter(this.props.filters, columnKey)} />
    });

    const changeFilterAndFetch = this.props.filteringAction.changeFilterAndFetch;
    const Search = (
      <tr>
        {Filters.slice(0,7)}
        <TripStatusSelect {...this.props.statusProps} />
      </tr>
    );

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
    driver: trip.Driver && `${trip.Driver.FirstName} ${trip.Driver.LastName}`,
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
    remarks: trip.Notes
  }
}

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
    this.setState({statusName: val, status: this.props.nameToID[val]}, () => {
      this.fetchTrips();
    });
  },
  changeFilter(attr, val) {
    let attrName;
    switch(attr) {
      case 'fleetName':
        attrName = 'fleet';
        break;

      case 'webstoreNames':
        attrName = 'merchant';
        break;

      default:
        attrName = attr;
    }

    this.setState({[attrName]: val});
  },
  changeFilterAndFetch(filters) {
    this.setState(filters, () => {
      this.fetchTrips();
    });
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
      isFetching: tripsIsFetching
    }

    return (
      <div>
        <div style={{opacity: tripsIsFetching ? 0.5 : 1}}>
          <Pagination {...paginationProps} />
          <Table {...tableProps} />
        </div>
      </div>
    );
  }
});

function StateToProps(state) {
  const {inboundTrips, driversStore} = state.app;
  const {isFetching, limit, total, currentPage, trips, filters} = inboundTrips;

  fleetList = driversStore.fleetList.dict;

  const paginationState = {
    currentPage: currentPage,
    limit: limit,
    total: total,
  }

  const statusList = state.app.containers.statusList;

  return {
    paginationState, trips, tripsIsFetching: isFetching,
    statusList: _.chain(statusList).map((key, val) => [val, key]).sortBy((arr) => (arr[1])).map((arr) => (arr[0])).value(),
    nameToID: _.reduce(statusList, (memo, key, val) => {
      memo[val] = key;
      return memo;
    }, {}),
    filters,
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
  };
}

export default connect(StateToProps, DispatchToProps)(TableStateful);
