import lodash from 'lodash';
import ClassName from 'classnames';
import moment from 'moment';
import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {Button} from 'react-bootstrap';
// import * as OutboundTrips from '../../modules/trips/actions/outbound';
import * as OutboundTrips from './outboundTripsService';
import {DropdownTypeAhead, Input, Pagination, ButtonWithLoading} from '../views/base';
import {DropdownWithState2} from '../views/base/dropdown';
import DateRangePicker from '../views/base/dateRangePicker';
import tableStyles from '../views/base/table.css';
import styles from './styles.css';
import {Glyph} from '../views/base/glyph';
import StatusDropdown from '../views/base/statusDropdown';
import {TripParser} from '../modules/trips';
import {modalAction} from '../modules/modals/constants';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import stylesModal from '../views/base/modal.css';
import classnaming from 'classnames';

import DateTime from 'react-datetime';
import {InputWithDefault} from '../views/base/input';
import {RadioGroup, Radio} from '../components/form';
import {formatDate} from '../helper/time';
import ImagePreview from '../views/base/imagePreview';
import ImageUploader from '../views/base/imageUploader';

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

const Tabs = React.createClass({
  displayName: 'Tabs',
  propTypes: {
    selected: React.PropTypes.number,
    children: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.element
    ]).isRequired
  },
  getDefaultProps() {
    return {
      selected: 0
    };
  },
  getInitialState() {
    return {
      selected: this.props.selected
    };
  },
  handleClick(index, event) {
    event.preventDefault();
    this.setState({
      selected: index
    });
  },
  _renderTitles() {
    function labels(child, index) {
      return (
        <li key={index} className={(this.state.selected === index ? styles.active : '')}>
          <a href="#" 
            onClick={this.handleClick.bind(this, index)}>
            {child.props.label}
          </a>
        </li>
      );
    }
    return (
      <ul className={styles.tabs__labels}>
        {this.props.children.map(labels.bind(this))}
      </ul>
    );
  },
  _renderContent() {
    return (
      <div className={styles.tabs__content}>
        {this.props.children[this.state.selected]}
      </div>
    );
  },
  render() {
    return (
      <div className="tabs">
        {this._renderTitles()}
        {this._renderContent()}
      </div>
    );
  }
});

const Pane = React.createClass({
  displayName: 'Pane',
  propTypes: {
    label: React.PropTypes.string.isRequired,
    children: React.PropTypes.element.isRequired
  },
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
});

const DetailRow = React.createClass({
  generateTypeContent() {
    const {type, value, placeholder} = this.props;
    
    switch (type) {
      case "datetime" :
        return (
          <span className={styles.inputForm}>
            <span className={styles.datetimeWrapper}>
              <DateTime onChange={this.props.onChange} defaultValue={value} 
                dateFormat='DD MMM YYYY' timeFormat="HH:mm:ss" viewMode='days'/>
            </span>
          </span>
        );
      case "image" :
        return (
          <div className={styles.imageUploaderWrapper}>
            <ImageUploader currentImageUrl={value} updateImageUrl={(data) => this.props.onChange(data)} />
          </div>
        );
      default :
        return (
          <span className={styles.inputForm}>
            <span className={styles.inputWrapper}>
              <InputWithDefault className="form-control" placeholder={placeholder} currentText={value} onChange={(data) => this.props.onChange(data)} type={type}/>
            </span>
          </span>
        );
      }
  },
  render() {
    const {isEditing, label, type, value, className, placeholder} = this.props;

    return (
      <div className={className}>
        <span className={styles.inputLabel}>{label}</span>
        {
          !isEditing &&
          <span className={styles.inputForm}>
          {
            type === "image" ?
            <ImagePreview imageUrl={value} />
            :
            value
          }
          </span>
        }
        {
          isEditing &&
          this.generateTypeContent()
        }
      </div>
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

const FleetInModal = React.createClass({
  getInitialState() {
    return {selected: this.props.selected}
  },
  select(key) {
    this.props.fleetInModalSelected(key);
    this.setState({selected: key});
  },
  render() {
    const {trip} = this.props;

    var qty = trip.numberPackages;
    var selected = (this.props.selected) ? this.props.selected : this.state.selected;


    const Fleets = _.map(this.props.items, (item, key) => {
      const currentLoad = (selected === key) ? item.CurrentLoad + qty : item.CurrentLoad;

      return (
        <div key={key} className={styles.ListInModal + ' ' + (selected === key ? styles.active : '')}>
          <Radio value={key} />
          <div className={styles.checkedFleet}></div>
          <img src={item.FleetManager.PictureUrl} />
          <div className={styles.vendorName}>
            <b>{item.FleetManager.CompanyDetail.CompanyName}</b>
          </div>
          <div className={styles.ovl}>
            <img src="/img/icon-grouping.png" />
            {currentLoad + '/' + item.FleetManager.CompanyDetail.OrderVolumeLimit}
          </div>
        </div>
      );
    });

    if (this.props.isFetching) {
      return (
        <div className={styles.searchLoadingArea + ' text-center'}>
          <img src="/img/icon-search-color.png" />
          <h3>Searching......</h3>
          <p>We will search for the best vendor suitable for the job, based on their location to the drop off area and zip code</p>
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
          <div className={styles.fleet}>
            <RadioGroup name="fleet" selectedValue={this.state.selected} onChange={this.select}>
              {Fleets}
            </RadioGroup>
          </div>
        );
      }
    }
  }
});

const DriverInModal = React.createClass({
  getInitialState() {
    return {selected: this.props.selected}
  },
  select(key) {
    this.props.driverInModalSelected(key);
    this.setState({selected: key});
  },
  render() {
    const {trip} = this.props;

    var weight = trip.weight;
    var selected = (this.props.selected) ? this.props.selected : this.state.selected;


    const Drivers = _.map(this.props.items, (item, key) => {
      const currentLoad = (selected === key) ? item.CurrentWeight + weight : item.CurrentWeight;
      const imgSrc = (item.Vehicle && item.Vehicle.VehicleID === 1) ? '/img/icon-vehicle-motor.png' : '/img/icon-vehicle-van.png';

      return (
        <div key={key} className={styles.ListInModal + ' ' + styles.colMd12 + ' ' + (selected === key ? styles.active : '')}>
          <div className={styles.colMd2 + ' ' + styles.noPadding}>
            <div className={styles.colMd6 + ' ' + styles.noPadding}>
              <Radio value={key} />
              <div className={styles.checkedFleet}></div>
            </div>
            <div className={styles.colMd6 + ' ' + styles.noPadding}>
              <img src={imgSrc} width="100%" />
            </div>
          </div>
          <div className={styles.colMd7 + ' ' + styles.vendorName}>
            <b>{item.FirstName + ' ' + item.LastName}</b>
            <br/>
            <span className={styles.infoWeight}>Available weight : {currentLoad + '/' + item.TotalCapability} kg</span>
          </div>
          <div className={styles.colMd3 + ' ' + styles.noPadding + ' ' + styles.driverDistance + ' pull-right'}>
            <span className={styles.infoList}>From your location</span>
            <div className={styles.ovl + ' ' + styles.colMd12}>
              <img src="/img/icon-location.png" width="24"/>
              {item.DistanceToNearestPickup}<span> km</span>
            </div>
          </div>
        </div>
      );
    });

    if (this.props.isFetching) {
      return (
        <div className={styles.searchLoadingArea + ' text-center'}>
          <img src="/img/icon-search-color.png" />
          <h3>Searching......</h3>
          <p>We will search for the best driver suitable for the job, based on their location to the drop off area and zip code</p>
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
          <div className={styles.fleet}>
            <RadioGroup name="driver" selectedValue={this.state.selected} className="row" onChange={this.select}>
              {Drivers}
            </RadioGroup>
          </div>
        );
      }
    }
  }
});

function FullAddress(address) {
  const Addr = address.Address1 && address.Address2 && (address.Address1.length < address.Address2.length) ? address.Address2 : address.Address1;
  return lodash.chain([Addr])
    .filter((str) => (str && str.length > 0))
    .value()
    .join(', ');
}

function TripDropOff(trip) {
  const destinationHub = trip.DestinationHub && (FullAddress(trip.DestinationHub));
  const destinationDistrict = trip.District && ("District " + trip.District.Name + " - " + trip.District.City + ' - ' + trip.District.Province);
  const dropoffAddress = trip.DropoffAddress && FullAddress(trip.DropoffAddress);

  return {
    address: destinationHub || dropoffAddress || "",
    city: (trip.DropoffAddress && trip.DropoffAddress.City) || (trip.District && trip.District.City) || "",
    state: (trip.DropoffAddress && trip.DropoffAddress.State) || (trip.District && trip.District.Province) || "",
  };
}

function AssignedTo(trip) {
  var className = (trip.Driver && trip.Driver.Vehicle && trip.Driver.Vehicle.VehicleID === 1) ? styles.iconVehicleMotor : styles.iconVehicleMiniVan;
  var isActionDisabled = ((trip.FleetManager && trip.FleetManager.CompanyDetail) || (trip.Driver) || (trip.ExternalTrip)) ? true : false;

  return {
    className: (trip.Driver && trip.Driver.Vehicle) ? className : '',
    companyName: (trip.FleetManager && trip.FleetManager.CompanyDetail) ? trip.FleetManager.CompanyDetail.CompanyName : '',
    driverDetail: (trip.Driver) ? trip.Driver.FirstName + ' ' + trip.Driver.LastName + ' / ' + trip.Driver.CountryCode + ' ' + trip.Driver.PhoneNumber : '',
    thirdPartyLogistic: (trip.ExternalTrip) ? trip.ExternalTrip.Transportation : '',
    awbNumber: (trip.ExternalTrip && trip.ExternalTrip.AwbNumber) ? ' ( ' + trip.ExternalTrip.AwbNumber + ' )' : '',
    isActionDisabled: isActionDisabled
  };
}

function Remarks(trip) {
  var notes = '';

  if (trip.Notes) {
    notes = trip.Notes;
    if (notes.length > 50) {
      notes = notes.substring(0, 50) + ' ...';
    };
  };

  return notes;
}

function Weight(trip) {
  var result = 0;

  if (trip.UserOrderRoutes) {
    trip.UserOrderRoutes.forEach(function(val, key) {
      result += val.UserOrder.PackageWeight;
    });
  };

  return result;
}

function DstHub(trip) {
  if(trip && trip.DestinationHub) {
    var text = 'Hub -- ' + trip.DestinationHub.Name;
    
    return text;
  }

  return;
}

function DstDistrict(trip) {
  if(trip && trip.District) {
    var text = 'District -- ' + trip.District.Name;
    return text;
  }

  return;
}

function ProcessTrip(trip) {
  const parsedTrip = TripParser(trip);
  const dropoff = TripDropOff(trip);
  let tripType;

  if (trip.District) {
    tripType = "Last Mile";
  } else if (trip.DestinationHub) {
    tripType = "Hub";
  } else {
    tripType = "No Destination Yet";
  }

  return {
    containerNumber: trip.ContainerNumber,
    district: trip.District && trip.District.Name,
    tripID: 'TRIP-' + trip.TripID,
    fleet: AssignedTo(trip),
    driver: trip.Driver && `${trip.Driver.FirstName} ${trip.Driver.LastName}`,
    nextDestination: tripType === "Last Mile" ? trip.District && `District ${trip.District.Name} - ${trip.District.City}` : trip.DestinationHub && `Hub ${trip.DestinationHub.Name}`,
    dropoffCity: dropoff.city,
    dropoffState: dropoff.state,
    dropoffTime: moment(new Date(trip.DropoffTime)).format('DD MMM YYYY HH:mm:ss'),
    key: trip.TripID,
    pickup: trip.PickupAddress && trip.PickupAddress.Address1,
    pickupTime: moment(new Date(trip.PickupTime)).format('DD MMM YYYY HH:mm:ss'),
    status: trip.OrderStatus && trip.OrderStatus.OrderStatus,
    tripNumber: trip.TripNumber,
    tripType: tripType,
    webstoreNames: parsedTrip.WebstoreNames,
    numberPackages: trip.UserOrderRoutes.length,
    weight: Weight(trip),
    remarks: Remarks(trip),
    deadline: moment(new Date(trip.CreatedDate)).add(3, 'hours').format('MMM DD, HH:mm'),
    actions: trip.TripID,
    isActionDisabled: AssignedTo(trip).isActionDisabled
  }
}

const TableStateful = React.createClass({
  componentWillMount() {
    this.props.initialLoad();
  },
  getInitialState() {
    return this.props.filters;
  },
  openModal(item) {
    this.state.trip = item;
    this.state.isAssign = true;
    this.setState({showModal: true});
    this.setState({isLastMile: false});
    this.setState({isNotLastMile: false});

    this.props.fetchListOnModal(item.key);
    this.setState({isFleetSet: false});
    this.setState({selectedFleet: ''});
    this.setState({isDriverSet: false});
    this.setState({selectedDriver: ''});
  },
  closeModal() {
    this.state.isAssign = false;
    this.setState({showModal: false});
  },
  isLastMile() {
    this.setState({isLastMile: true});
  },
  isNotLastMile() {
    this.setState({isNotLastMile: true});
  },
  fleetInModalSelected(key) {
    this.state.fleet = this.props.nearbyfleets.fleets[key];
    this.setState({selectedFleet: key});
    this.setState({isFleetSet: true});
  },
  driverInModalSelected(key) {
    this.state.driver = this.props.nearbyDrivers.drivers[key];
    this.setState({selectedDriver: key});
    this.setState({isDriverSet: true});
  },
  onChange(key) {
    return (val) => {
      this.props.update({[key]: val});
    }
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
  driverSet() {
    this.props.DriverSet(this.state.trip.key, this.state.driver.UserID);
  },
  fleetSet() {
    this.props.FleetSet(this.state.trip.key, this.state.fleet.FleetManagerID);
  },
  thirdPartyLogisticSave() {
    this.props.ThirdPartyLogisticSave(this.state.trip.key);
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

    const trip = this.state.trip;

    const fleetsProps = {
      trip: trip,
      items: this.props.nearbyfleets.fleets,
      isFetching: this.props.nearbyfleets.isFetching,
      selected: this.state.selectedFleet,
      fleetInModalSelected: this.fleetInModalSelected
    }

    const driversProps = {
      trip: trip,
      items: this.props.nearbyDrivers.drivers,
      isFetching: this.props.nearbyDrivers.isFetching,
      selected: this.state.selectedDriver,
      driverInModalSelected: this.driverInModalSelected
    }

    const nextDestination = DstHub(trip) || DstDistrict(trip);
    
    return (
      <div>
        <div style={{opacity: tripsIsFetching ? 0.5 : 1}}>
          <Table {...tableProps} />
          <Pagination {...paginationProps} />
        </div>
        {
          this.state.showModal &&
          <ModalContainer onClose={this.closeModal}>
            <ModalDialog onClose={this.closeModal} className={styles.modalDialog}>
              <div className={styles.modalHeader}>
                <h1>Assign Trip</h1>
              </div>
              <div className={styles.modalInfo + " nb"}>
                <div>
                  <div className="row">
                    <div className={styles.modalInfoTripID}>
                      <small>Trip ID</small>
                      <p>{trip.tripID}</p>
                    </div>
                    <div className={styles.modalInfoWeight}>
                      <small>Total Weight</small>
                      <p>{trip.weight} Kg</p>
                    </div>
                    <div className={styles.modalInfoQuantity}>
                      <small>Quantity</small>
                      <p>{trip.numberPackages}</p>
                    </div>
                    <div className={styles.modalInfoDeadline}>
                      <small>Deadline</small>
                      <p className={styles.red}>{trip.deadline}</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className={styles.modalInfoDestination}>
                      <small>Destination Area</small>
                      <p>{trip.nextDestination}</p>
                    </div>
                    { this.state.isNotLastMile &&
                      <div className={styles.modalInfoNotLastMile}>
                        <small>Since its not a last mile, we suggest that you send this orders to</small>
                        <p>{nextDestination}</p>
                      </div>
                    }
                  </div>
                </div>
              </div>
              { this.state.isAssign && !this.state.isLastMile && !this.state.isNotLastMile &&
                <div className={styles.modalBody}>
                  <div className={styles.isLastMile + " nb"}>
                    <p>Is it a last mile order?</p>
                    <button className={styles.modalNo + " btn btn-md btn-danger"} onClick={this.isNotLastMile}><Glyph name={"remove-sign"} /> NO</button>
                    <button className={styles.modalYes + " btn btn-md btn-success"} onClick={this.isLastMile}><Glyph name={"ok-sign"} /> YES</button>
                  </div>
                </div>
              }

              { this.state.isLastMile &&
                <div className="nb">
                  <Tabs selected={0}>
                    <Pane label="Assign To My Driver">
                      <div>
                        <div className={styles.modalTabPanel}>
                          <div>
                            <DriverInModal {...driversProps} />
                          </div>
                        </div>
                        <div className={styles.modalFooter}>
                          { !this.state.isDriverSet &&
                            <p>
                              <small>Please choose the driver that you want to do this trip.
                              <br/>
                              Its better to choose a driver who has minimum weight.</small>
                            </p>
                          }
                          { this.state.isDriverSet &&
                            <p>
                              <small>You have selected a driver for this trip!
                              <br/>
                              Please click on this button to continue</small>
                            </p>
                          }

                          <button className="btn btn-md btn-success" onClick={this.driverSet} disabled={!this.state.isDriverSet}>Assign To Driver</button>
                        </div>
                      </div>
                    </Pane>
                    <Pane label="Assign To Vendor">
                      <div>
                        <div className={styles.modalTabPanel}>
                          <div>
                            <FleetInModal {...fleetsProps} />
                          </div>
                        </div>
                        <div className={styles.modalFooter}>
                          { !this.state.isFleetSet &&
                            <p><small>Please choose a vendor that you want to do this trip.</small></p>
                          }
                          { this.state.isFleetSet &&
                            <p><small>You have selected a vendor for this trip!
                            <br/>
                            Please click on this button to continue</small></p>
                          }
                          
                          <button className="btn btn-md btn-success" onClick={this.fleetSet} disabled={!this.state.isFleetSet}>Assign To Vendor</button>
                        </div>
                      </div>
                    </Pane>
                    <Pane label="Long Haul">
                      <div>
                        <div className={styles.modalTabPanel}>
                          <div className="row">
                            <DetailRow label="3PL NAME *" className={styles.colMd12 + ' ' + styles.detailRow} placeholder="Write the 3PL name here..." value={trip.ExternalTrip && trip.ExternalTrip.Sender} isEditing={true} type="text" onChange={this.onChange('Sender')} />
                            <DetailRow label="TRANSPORTATION *" className={styles.colMd12 + ' ' + styles.detailRow} placeholder="Write the transportation here..." value={trip.ExternalTrip && trip.ExternalTrip.Transportation} isEditing={true} type="text" onChange={this.onChange('Transportation')} />
                            <DetailRow label="DEPARTURE TIME *" className={styles.colMd6 + ' ' + styles.detailRow} value={trip.DepartureTime && formatDate(trip.DepartureTime)} isEditing={true} type="datetime" onChange={this.onChange('DepartureTime')} />
                            <DetailRow label="ETA *" className={styles.colMd6 + ' ' + styles.detailRow + ' ' + styles.detailRow} value={trip.ExternalTrip && trip.ExternalTrip.ArrivalTime && formatDate(trip.ExternalTrip.ArrivalTime)} isEditing={true} type="datetime" onChange={this.onChange('ArrivalTime')} />
                            <DetailRow label="FEE *" className={styles.colMd6 + ' ' + styles.detailRow} value={trip.ExternalTrip && trip.ExternalTrip.Fee} isEditing={true} type="number" onChange={this.onChange('Fee')} />
                            <DetailRow label="AWB NUMBER *" className={styles.colMd6 + ' ' + styles.detailRow} value={trip.ExternalTrip && trip.ExternalTrip.AwbNumber} isEditing={true} type="text" onChange={this.onChange('AwbNumber')} />
                            <div className={styles.colMd3}></div>
                            <div className={styles.colMd9}>
                              <div className={styles.uploadButtonText + ' ' + styles.colMd6 + ' ' + styles.noPadding}>
                                <p>Upload your receipt here *</p>
                              </div>
                              <DetailRow className={styles.colMd6 + ' ' + styles.detailRow + ' ' + styles.uploadButton} value={trip.PictureUrl} isEditing={true} type="image" onChange={this.onChange('PictureUrl')}/>
                            </div>
                          </div>
                        </div>
                        <div className={styles.modalFooter}>
                          <p><small>You need to fill information above before you can continue.</small></p>
                          <button className="btn btn-md btn-success" onClick={this.thirdPartyLogisticSave}>Assign To 3PL</button>
                        </div>
                      </div>
                    </Pane>
                  </Tabs>
                </div>
              }

              { this.state.isNotLastMile &&
                <div className="nb">
                  <Tabs selected={0}>
                    <Pane label="Assign To My Driver">
                      <div>
                        <div className={styles.modalTabPanel}>
                          <div>
                            <DriverInModal {...driversProps} />
                          </div>
                        </div>
                        <div className={styles.modalFooter}>
                          { !this.state.isDriverSet &&
                            <p>
                              <small>Please choose the driver that you want to do this trip.
                              <br/>
                              Its better to choose a driver who has minimum weight.</small>
                            </p>
                          }
                          { this.state.isDriverSet &&
                            <p>
                              <small>You have selected a driver for this trip!
                              <br/>
                              Please click on this button to continue</small>
                            </p>
                          }

                          <button className="btn btn-md btn-success" onClick={this.driverSet} disabled={!this.state.isDriverSet}>Assign To Driver</button>
                        </div>
                      </div>
                    </Pane>
                    <Pane label="Assign To Vendor">
                      <div>
                        <div className={styles.modalTabPanel}>
                          <div>
                            <FleetInModal {...fleetsProps} />
                          </div>
                        </div>
                        <div className={styles.modalFooter}>
                          { !this.state.isFleetSet &&
                            <p><small>Please choose a vendor that you want to do this trip.</small></p>
                          }
                          { this.state.isFleetSet &&
                            <p><small>You have selected a vendor for this trip!
                            <br/>
                            Please click on this button to continue</small></p>
                          }
                          
                          <button className="btn btn-md btn-success" onClick={this.fleetSet} disabled={!this.state.isFleetSet}>Assign To Vendor</button>
                        </div>
                      </div>
                    </Pane>
                    <Pane label="Long Haul">
                      <div>
                        <div className={styles.modalTabPanel}>
                          <div className="row">
                            <DetailRow label="3PL NAME *" className={styles.colMd12 + ' ' + styles.detailRow} placeholder="Write the 3PL name here..." value={trip.ExternalTrip && trip.ExternalTrip.Sender} isEditing={true} type="text" onChange={this.onChange('Sender')} />
                            <DetailRow label="TRANSPORTATION *" className={styles.colMd12 + ' ' + styles.detailRow} placeholder="Write the transportation here..." value={trip.ExternalTrip && trip.ExternalTrip.Transportation} isEditing={true} type="text" onChange={this.onChange('Transportation')} />
                            <DetailRow label="DEPARTURE TIME *" className={styles.colMd6 + ' ' + styles.detailRow} value={trip.DepartureTime && formatDate(trip.DepartureTime)} isEditing={true} type="datetime" onChange={this.onChange('DepartureTime')} />
                            <DetailRow label="ETA *" className={styles.colMd6 + ' ' + styles.detailRow + ' ' + styles.detailRow} value={trip.ExternalTrip && trip.ExternalTrip.ArrivalTime && formatDate(trip.ExternalTrip.ArrivalTime)} isEditing={true} type="datetime" onChange={this.onChange('ArrivalTime')} />
                            <DetailRow label="FEE *" className={styles.colMd6 + ' ' + styles.detailRow} value={trip.ExternalTrip && trip.ExternalTrip.Fee} isEditing={true} type="number" onChange={this.onChange('Fee')} />
                            <DetailRow label="AWB NUMBER *" className={styles.colMd6 + ' ' + styles.detailRow} value={trip.ExternalTrip && trip.ExternalTrip.AwbNumber} isEditing={true} type="text" onChange={this.onChange('AwbNumber')} />
                            <div className={styles.colMd3}></div>
                            <div className={styles.colMd9}>
                              <div className={styles.uploadButtonText + ' ' + styles.colMd6 + ' ' + styles.noPadding}>
                                <p>Upload your receipt here *</p>
                              </div>
                              <DetailRow className={styles.colMd6 + ' ' + styles.detailRow + ' ' + styles.uploadButton} value={trip.PictureUrl} isEditing={true} type="image" onChange={this.onChange('PictureUrl')}/>
                            </div>
                          </div>
                        </div>
                        <div className={styles.modalFooter}>
                          <p><small>You need to fill information above before you can continue.</small></p>
                          <button className="btn btn-md btn-success" onClick={this.thirdPartyLogisticSave}>Assign To 3PL</button>
                        </div>
                      </div>
                    </Pane>
                  </Tabs>
                </div>
              }

              { this.state.isSuccessEditing &&
                <div className={styles.modalBody}>
                  <div>
                    <img className={styles.successIcon} src={"/img/icon-success.png"} />
                    <div className={styles.updateSuccess}>
                      Update Order Success
                    </div> 
                    <button className={styles.saveButton} onClick={this.confirmSuccess}>OK</button>
                  </div>
                </div>
              }

              { this.state.isAssign && !this.state.isLastMile && !this.state.isNotLastMile &&
                <div className={styles.modalFooter}>
                  <p><small>Please choose if this order is a last mile order or not.</small></p>
                </div>
              }
            </ModalDialog>
          </ModalContainer>
        }
      </div>
    );
  }
});

function StateToProps(state) {
  const {outboundTripsService} = state.app;
  const {isFetching, limit, total, currentPage, trips, filters, nearbyfleets, nearbyDrivers} = outboundTripsService;

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
    nearbyfleets,
    nearbyDrivers
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
    ThirdPartyLogisticSave(tripID) {
      dispatch(OutboundTrips.CreateExternalTrip(tripID));
    },
    update: (trip) => {
      dispatch(OutboundTrips.UpdateExternalTrip(trip));
    },
  };
}

export default connect(StateToProps, DispatchToProps)(TableStateful);
