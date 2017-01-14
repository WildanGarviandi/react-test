import lodash from 'lodash';
import ClassName from 'classnames';
import moment from 'moment';
import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {Button} from 'react-bootstrap';
import * as OutboundTrips from './outboundTripsService';
import {DropdownTypeAhead, Input, Pagination, ButtonWithLoading} from '../views/base';
import {DropdownWithState2} from '../views/base/dropdown';
import DateRangePicker from '../views/base/dateRangePicker';
import tableStyles from '../views/base/table.css';
import styles from './styles.css';
import {Glyph} from '../views/base/glyph';
import StatusDropdown from '../views/base/statusDropdown';
import {modalAction} from '../modules/modals/constants';
import dateTimeStyles from '../views/container/datetime.css';
import stylesModal from '../views/base/modal.css';
import classnaming from 'classnames';

import DateTime from 'react-datetime';
import {InputWithDefault} from '../views/base/input';
import {RadioGroup, Radio} from '../components/form';
import {formatDate, formatDateHourOnly} from '../helper/time';
import ImagePreview from '../views/base/imagePreview';
import ImageUploader from '../views/base/imageUploader';

import {FullAddress, TripDropOff, AssignedTo, Remarks, Weight, DstHub, DstDistrict, ProcessTrip} from './outboundTripsHelper';
import {Inverval} from './outboundTripsModal';

const ColumnsOrder = ['tripID', 'nextDestination', 'tripType', 'fleet', 
  'status', 'numberPackages', 'weight', 'remarks', 'deadline', 'actions'];

const ColumnsTitle = {
  containerNumber: "Container",
  district: "District",
  tripID: "Trip ID",
  fleet: "Assigned To",
  driver: "Driver",
  nextDestination: "Destination",
  dropoffTime: "Dropoff Time",
  pickup: "Pickup Address",
  pickupTime: "Pickup Time",
  status: "Status",
  tripNumber: "Trip Number",
  tripType: "Type",
  webstoreNames: "Webstore",
  numberPackages: "Quantity",
  weight: "Weight",
  remarks: "Remarks",
  deadline: "Deadline", 
  actions: "Action"
}

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
      <Input styles={{input: tableStyles.searchInput}} base={{type:"text"}} onChange={this.props.onChange} onEnterKeyPressed={this.props.onEnterKeyPressed} base={{value:this.props.filter}} />
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
  const statusName = state.app.outboundTrips.filtersStatus;
  return {
    val: statusName,
  }
}

function SelectDispatch(dispatch) {
  return {
    handleSelect: (val) => {
      dispatch(OutboundTrips.SetFiltersStatus(val.value));
    }
  }
}

const TrueSelect = connect(StateToStatus, SelectDispatch)(StatusDropdown);

const TripTypeDropDown = React.createClass({
  handleSelect(val) {
    this.props.setType(val.key);
  },
  render() {
    const options = [
      { key: 0, value: "All"},
      { key: 1, value: "Last Mile"},
      { key: 2, value: "Hub"},
      { key: 3, value: "No Destination Yet"},
    ];
    const val = options[this.props.val].value;

    return (
      <DropdownWithState2 val={val} options={options} handleSelect={this.handleSelect} />
    );
  }
});

function TripTypeDropDownDispatch(dispatch) {
  return {
    setType: (type) => {
      dispatch(OutboundTrips.AddFilters({'tripType': type}));
    }
  }
}

function TripTypeDropDownState(state) {
  return {
    val: state.app.outboundTrips.filters.tripType,
  }
}

const TripTypeDropDownWithState = connect(TripTypeDropDownState, TripTypeDropDownDispatch)(TripTypeDropDown);

const TripStatusSelect = React.createClass({
  selectVal(val) {
    this.props.pickStatus(val);
  },
  render() {
    const {statusList, statusName} = this.props;
    return (
      <TrueSelect />
    );
  }
});

const Table = React.createClass({
  render() {
    const Headers = _.map(ColumnsOrder, (columnKey) => {
      switch(columnKey) {
        case "tripID": {
          return <th key={columnKey} className={styles.thTripID}>{ColumnsTitle[columnKey]}</th>;
        }

        case "fleet": {
          return <th key={columnKey} className={styles.thAssignedTo}>{ColumnsTitle[columnKey]}</th>;
        }

        case "actions": {
          return <th key={columnKey} className={styles.thActions}>{ColumnsTitle[columnKey]}</th>;
        }

        default: {
          return <th key={columnKey}>{ColumnsTitle[columnKey]}</th>;
        }
      }
    });

    const Body = _.map(this.props.items, (item) => {
      const cells = _.map(ColumnsOrder, (columnKey) => {
        switch(columnKey) {
          case "tripID": {
            return <td className={tableStyles.td + ' ' + styles.clickable} key={columnKey} onClick={this.props.toDetails.bind(null, item.key)}>{item[columnKey]}</td>;
          }

          case "fleet": {
            const textValue = (item[columnKey].thirdPartyLogistic) ? <p><b>{item[columnKey].thirdPartyLogistic}</b><br/>{item[columnKey].awbNumber}</p> : <p><b>{item[columnKey].companyName}</b><br/>{item[columnKey].driverDetail}</p>;

            return <td className={tableStyles.td + ' ' + item[columnKey].className + ' ' + styles.withIcon} key={columnKey}>{textValue}</td>;
          }

          case "weight": {
            return <td className={tableStyles.td} key={columnKey}>{item[columnKey]} Kg</td>;
          }

          case "actions": {
            const btnPrint = <div className={styles.btnPrintOnTable}>
                <a href={"/trips/" + item[columnKey] + "/manifest#"} className="btn btn-sm btn-default" target="_blank">
                  <Glyph name={"print"} />
                </a>
              </div>;
            const btnAssign = <div className={styles.btnAssignOnTable}>
                <button className={styles.btnAssign + " btn btn-sm btn-success"} disabled={item.isActionDisabled} onClick={this.props.openModal.bind(null, item)}>
                  Assign
                </button>
              </div>;
            const btnAction = <div className='nb'>{btnPrint}{btnAssign}</div>
            return <td className={tableStyles.td} key={columnKey}>{btnAction}</td>;
          }

          default: {
            return <td className={tableStyles.td} key={columnKey}>{item[columnKey]}</td>;
          }
        }
      });

      return <tr className={styles.tr} key={item.key}>{cells}</tr>;
    });

    const changeFilter = this.props.filteringAction.changeFilter;
    const Filters = _.map(ColumnsOrder, (columnKey) => {
      switch(columnKey) {
        case "nextDestination": {
          return (
            <div key={columnKey} className={styles.colMd3 + ' ' +styles.filterDropDown}>
              <span className={styles.title}>{ColumnsTitle[columnKey]}</span>
              <SearchCell key={columnKey} attr={columnKey} onChange={changeFilter.bind(null, columnKey)} onEnterKeyPressed={this.props.filteringAction.fetchTrips} filter={FindFilter(this.props.filters, columnKey)} />
            </div>
          )
        }

        case "tripType": {
          return (
            <div key={columnKey} className={styles.colMd3 + ' ' +styles.filterDropDown}>
              <span>{ColumnsTitle[columnKey]}</span>
              <TripTypeDropDownWithState />
            </div>
          )
        }

        case "status": {
          return (
            <div key={columnKey} className={styles.colMd3 + ' ' +styles.filterDropDown}>
              <span>{ColumnsTitle[columnKey]}</span>
              <TripStatusSelect {...this.props.statusProps} />
            </div>
          )
        }
      }
    });

    const changeFilterAndFetch = this.props.filteringAction.changeFilterAndFetch;
    const Search = (
      <div className='nb'>
        <div className='row'>
          {Filters}
        </div>
      </div>
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
              You have no outbound trips
            </div>
          </div>
        );
      } else {
        return (
          <div>
            {Search}
            <table className={tableStyles.table}>
              <thead><tr>{Headers}</tr></thead>
              <tbody>{Body}</tbody>
            </table>
          </div>
        );
      }
    }
  }
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
  openModal(item) {
    this.props.fetchListOnModal(item.key);
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
      openModal: this.openModal
    }
    
    return (
      <div>
        <div style={{opacity: tripsIsFetching ? 0.5 : 1}}>
          <Table {...tableProps} />
          <Pagination {...paginationProps} />
        </div>
      </div>
    );
  }
});

function StateToProps(state) {
  const {outboundTripsService} = state.app;
  const {isFetching, limit, total, currentPage, trips, filters} = outboundTripsService;

  const paginationState = {
    currentPage: currentPage,
    limit: limit,
    total: total
  }

  const statusList = state.app.containers.statusList;

  return {
    paginationState, trips, tripsIsFetching: isFetching,
    statusList: _.chain(statusList).map((key, val) => [val, key]).sortBy((arr) => (arr[1])).map((arr) => (arr[0])).value(),
    nameToID: _.reduce(statusList, (memo, key, val) => {
      memo[val] = key;
      return memo;
    }, {}),
    filters
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
    DriverSet(tripID, driverID) {
      dispatch(OutboundTrips.AssignDriver(tripID, driverID));
    },
    FleetSet(tripID, fleetManagerID) {
      dispatch(OutboundTrips.AssignFleet(tripID, fleetManagerID));
    },
    update: (trip) => {
      dispatch(OutboundTrips.UpdateExternalTrip(trip));
    },
  };
}

export default connect(StateToProps, DispatchToProps)(TableStateful);
