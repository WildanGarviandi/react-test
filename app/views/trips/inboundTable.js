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
import tableStyles from '../base/table.css';
import StatusDropdown from '../base/statusDropdown';
import {TripParser} from '../../modules/trips';

const ColumnsOrder = ['driver', 'webstoreNames', 'pickup', 'containerNumber', 'status'];

const ColumnsTitle = {
  containerNumber: "Container",
  district: "District",
  driver: "Driver",
  dropoff: "Next Destination",
  dropoffTime: "Dropoff Time",
  pickup: "Pickup Address",
  pickupTime: "Pickup Time",
  status: "Status",
  tripNumber: "Trip Number",
  webstoreNames: "Webstore",
}

const SearchCell = React.createClass({
  render() {
    return (
      <td className={ClassName(tableStyles.td, tableStyles.search)}>
        <Input styles={{input: tableStyles.searchInput}} base={{type:"text"}} onChange={this.props.onChange} onEnterKeyPressed={this.props.onEnterKeyPressed} />
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
      return <th className={tableStyles.th} key={columnKey}>{ColumnsTitle[columnKey]}</th>;
    });

    const Body = _.map(this.props.items, (item) => {
      const cells = _.map(ColumnsOrder, (columnKey) => {
        return <td className={tableStyles.td} key={columnKey}>{item[columnKey]}</td>;
      });

      return <tr className={tableStyles.tr} key={item.key} onClick={this.props.toDetails.bind(null, item.key)}>{cells}</tr>;
    });

    const changeFilter = this.props.filteringAction.changeFilter;
    const Filters = _.map(ColumnsOrder, (columnKey) => {
      return <SearchCell key={columnKey} attr={columnKey} onChange={changeFilter.bind(null, columnKey)} onEnterKeyPressed={this.props.filteringAction.fetchTrips} />
    });

    const changeFilterAndFetch = this.props.filteringAction.changeFilterAndFetch;
    const Search = (
      <tr>
        {Filters.slice(0,4)}
        <TripStatusSelect {...this.props.statusProps} />
      </tr>
    );

    return (
      <table className={tableStyles.table}>
        <thead><tr>{Headers}</tr></thead>
        <tbody>{Search}</tbody>
        <tbody>{Body}</tbody>
      </table>
    );
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

  return {
    containerNumber: trip.ContainerNumber,
    district: trip.District && trip.District.Name,
    driver: trip.Driver && `${trip.Driver.FirstName} ${trip.Driver.LastName}`,
    dropoff: TripDropOff(trip),
    dropoffTime: trip.DropoffTime,
    key: trip.TripID,
    tripNumber: trip.TripNumber,
    pickup: trip.PickupAddress && trip.PickupAddress.Address1,
    pickupTime: trip.PickupTime,
    status: trip.OrderStatus && trip.OrderStatus.OrderStatus,
    webstoreNames: parsedTrip.WebstoreNames,
  }
}

const TableStateful = React.createClass({
  componentWillMount() {
    this.props.initialLoad();
  },
  getInitialState() {
    return {statusName: 'SHOW ALL'};
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
    this.setState({[attr]: val});
  },
  changeFilterAndFetch(filters) {
    this.setState(filters, () => {
      this.fetchTrips();
    });
  },
  render() {
    const {paginationAction, paginationState, statusParams, tripDetails, tripsIsFetching} = this.props;

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
  const {inboundTrips} = state.app;
  const {isFetching, limit, total, currentPage, trips} = inboundTrips;

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
  };
}

function DispatchToProps(dispatch, ownProps) {
  return {
    initialLoad() {
      dispatch(InboundTrips.FetchList());
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
