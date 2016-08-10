import ClassName from 'classnames';
import moment from 'moment';
import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {TripsFetch, TripsSetCurrentPage, TripsSetFilter, TripsSetLimit} from '../../modules/trips/actions/tripsFetch';
import {DropdownTypeAhead, Input, Pagination} from '../base';
import DateRangePicker from '../base/dateRangePicker';
import tableStyles from '../base/table.css';

const ColumnsOrder = ['tripNumber', 'pickup', 'dropoff', 'pickupTime', 'dropoffTime', 'driver', 'containerNumber', 'district', 'status'];

const ColumnsTitle = {
  containerNumber: "Container",
  district: "District",
  driver: "Driver",
  dropoff: "Dropoff Address",
  dropoffTime: "Dropoff Time",
  pickup: "Pickup Address",
  pickupTime: "Pickup Time",
  status: "Status",
  tripNumber: "Trip Number",
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
})

const TripStatusSelect = React.createClass({
  selectVal(val) {
    this.props.pickStatus(val);
  },
  render() {
    const {statusList, statusName} = this.props;
    return (
      <td className={ClassName(tableStyles.td, tableStyles.search)} style={{width: 150}}>
        <DropdownTypeAhead options={statusList} selectVal={this.selectVal} val={statusName} />
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
        {Filters.slice(0,3)}
        <DateCell changeFilter={changeFilterAndFetch} attr={'Pickup'} />
        <DateCell changeFilter={changeFilterAndFetch} attr={'Dropoff'} />
        {Filters.slice(5,8)}
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

function ProcessTrip(trip) {
  return {
    containerNumber: trip.ContainerNumber,
    district: trip.District && trip.District.Name,
    driver: trip.Driver && `${trip.Driver.FirstName} ${trip.Driver.LastName}`,
    dropoff: trip.DropoffAddress && trip.DropoffAddress.Address1,
    dropoffTime: trip.DropoffTime,
    key: trip.TripID,
    tripNumber: trip.TripNumber,
    pickup: trip.PickupAddress && trip.PickupAddress.Address1,
    pickupTime: trip.PickupTime,
    status: trip.OrderStatus && trip.OrderStatus.OrderStatus,
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
        <Pagination {...paginationProps} />
        <div style={{opacity: tripsIsFetching ? 0.5 : 1}}>
          <Table {...tableProps} />
        </div>
      </div>
    );
  }
});

function StateToProps(state) {
  const tripsStore = state.app.trips;
  const tripsList = tripsStore.list;
  const tripsState = tripsStore.state;
  const tripsQuery = tripsStore.query;

  const tripsIsFetching = tripsState.isFetching;
  const tripsShown = tripsState.shown;
  const trips = _.map(tripsShown, (idx) => tripsList[idx]);

  const tripPerPage = tripsQuery.limit;

  const paginationState = {
    currentPage: tripsQuery.currentPage,
    limit: tripsQuery.limit,
    totalItem: tripsState.totalItem,
  }

  const statusList = state.app.containers.statusList;

  return {
    paginationState, trips, tripsIsFetching,
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
      dispatch(TripsFetch());
    },
    changeFilter(filters) {
      dispatch(TripsSetFilter(filters));
    },
    paginationAction: {
      setCurrentPage(pageNum) {
        dispatch(TripsSetCurrentPage(pageNum));
      },
      setLimit(limit) {
        dispatch(TripsSetLimit(limit));
      },
    },
    tripDetails(id) {
      dispatch(push('/tripDetails/' + id));
    },
  };
}

export default connect(StateToProps, DispatchToProps)(TableStateful);
