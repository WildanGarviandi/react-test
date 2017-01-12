import lodash from 'lodash';
import ClassName from 'classnames';
import moment from 'moment';
import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import * as PickupOrdersReady from './pickupOrdersReadyService';
import {DropdownTypeAhead, Input, Pagination, ButtonStandard} from '../views/base';
import DateRangePicker from '../views/base/dateRangePicker';
import tableStyles from '../views/base/table.css';
import StatusDropdown from '../views/base/statusDropdown';
import {TripParser} from '../modules/trips';
import {OrderParser} from '../modules/orders';
import {formatDate} from '../helper/time';
import {modalAction} from '../modules/modals/constants';
import stylesModal from '../views/base/modal.css';
import classnaming from 'classnames';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import styles from './styles.css';
import BodyRow, {CheckBoxCell, LinkCell, TextCell, OrderIDLinkCell, ButtonCell, IDCell} from '../views/base/cells';
import {CheckboxHeader, CheckboxCell} from '../views/base/tableCell';
import {FilterTop, FilterText} from '../components/form';
import * as TripDetails from '../modules/inboundTripDetails';
import config from '../config/configValues.json';
import Countdown from 'react-cntdwn';

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

let fleetList = [];
let driverList = [];
let cityList = {}; 
let selectedDriver = null;
let selectedFleet = null;

/*
 * Get filter text from store
 *
*/
function getStoreFilterText(keyword, title) {
  return (store) => {
    const {filters} = store.app.pickupOrdersReady;
    return {
      value: filters[keyword],
      title: title
    }
  }    
}

/*
 * Dispatch filter text
 *
*/
function dispatchFilterText(keyword) {
  return (dispatch) => {
    function OnChange(e) {
      const newFilters = {[keyword]: e.target.value};
      dispatch(PickupOrdersReady.UpdateFilters(newFilters));
    }

    function OnKeyDown(e) {
      if(e.keyCode !== 13) {
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
    let cityOptions = [{
      key: 0, value: "All", 
    }];

    let listOptions = [{
      key: 0, value: "All"
    }, {
      key: 1, value: "Trip",
    }, {
      key: 2, value: "Order", 
    }];

    cityOptions = cityOptions.concat(lodash.chain(cityList)
       .map((key, val) => ({key:key, value: val}))
       .sortBy((arr) => (arr.key))
         .value());

    const options = {
      "city": cityOptions,
      "listType": listOptions
    }

    return {
      value: store.app.pickupOrdersReady[name],
      options: options[name],
      title: title
    }
  }
}

/*
 * Dispatch filter dropdown
 *
*/
function dispatchFilterDropdown(filterKeyword) {
  return (dispatch) => {
    return {
      handleSelect: (selectedOption) => {
        const SetFn = PickupOrdersReady.SetDropDownFilter(filterKeyword);
        dispatch(SetFn(selectedOption));
      }
    }
  }
}

/*
 * Connect store and dispatch for filter dropdown
 *
*/
function connectFilterDropdown(keyword, title) {
  return connect(getStoreFilterDropdown(keyword, title), dispatchFilterDropdown(keyword));
}

const MerchantFilter = connectFilterText('merchant', 'Merchant')(FilterText);
const CityFilter = connectFilterDropdown('city', 'City')(FilterTop);
const TypeFilter = connectFilterDropdown('listType', 'Type')(FilterTop);
const ZipFilter = connectFilterText('zipCode', 'ZIP Code')(FilterText);

/*
 * Dispatch for link cell
 *
*/
function mapDispatchToLink(dispatch, ownParams) {
  return {
    onClick: function() {
      dispatch(PickupOrdersReady.ShowDetails(parseInt(ownParams.item.tripID)));
    }
  }
}

/*
 * Dispatch for button cell
 *
*/
function mapDispatchToButton(dispatch, ownParams) {
  return {
    onClick: function() {
      selectedFleet = null;
      selectedDriver = null;
      dispatch(PickupOrdersReady.ShowAssignModal(parseInt(ownParams.item.tripID)));
      dispatch(PickupOrdersReady.FetchDrivers(parseInt(ownParams.item.tripID)));
    }
  }
}

const PickupOrdersID = connect(undefined, mapDispatchToLink)(IDCell);
const PickupOrdersButton = connect(undefined, mapDispatchToButton)(ButtonCell);

function AutoButtonGroup({onClick, disabled}) {
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
    onClick: function() {
      dispatch(PickupOrdersReady.AutoGroup());
    }
  }
}

const AutoGroupButton = connect(undefined, mapDispatchToAutoButtonGroup)(AutoButtonGroup);

function ManualButtonGroup({onClick, disabled}) {
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
    onClick: function() {
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
    onToggle: function() {
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
    onToggle: function(val) {
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
    const {isFetching} = this.props;
    const style = isFetching ? {opacity: 0.5} : {};

    return (
      <div className={styles.filterTop}>
        <TypeFilter />
        <MerchantFilter />
        <CityFilter />
        <ZipFilter />
        <AutoGroupButton disabled={!this.props.isAutoGroupActive} />
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
            return <td key={columnKey} className={tableStyles.td}><PickupOrdersID item={item} text={item[columnKey]} /></td>;
          } else {
            return <td key={columnKey} className={tableStyles.td}>{item['orderID']}</td>;
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
              <span style={{color: 'black'}}>
                <span>
                  {Duration.humanize()}
                </span>
              </span>
            </td>
          } else if (Duration._milliseconds < 0) {
            return <td key={columnKey} className={tableStyles.td} key={columnKey}>
              <span style={{color: 'red'}}>
                <span>
                  Passed
                </span>
              </span>
            </td>
          } else {
            let normalDeadline = (Duration._milliseconds > config.deadline['3hours']) && (Duration._milliseconds < config.deadline.day);
            return <td key={columnKey} className={tableStyles.td} key={columnKey}>
              <span style={{color: normalDeadline ? 'black' : 'red'}}>
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
        if (!lodash.isEmpty(this.props.filters)) {
          return (
            <table className={styles.table}>
              <thead><tr>{Headers}</tr></thead>
              <tbody className={styles.noOrder}>
                <tr>
                  <td colSpan={ColumnsOrder.length}>
                    <div className={styles.noOrderDesc}>
                      <img src="/img/image-ok-ready.png" />
                      <div style={{fontSize: 20}}>
                        Orders not found
                      </div>
                      <div style={{fontSize: 12, marginTop: 20}}>
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
                      <div style={{fontSize: 20}}>
                        You have assigned all orders!
                      </div>
                      <div style={{fontSize: 12, marginTop: 20}}>
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
      weight: parsedTrip.Weight,
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
      weight: trip.PackageWeight,
      isTrip: false,
      deadline: trip.Deadline,
      IsChecked: trip.IsChecked,
      orderID: `${trip.UserOrderNumber} (${trip.WebOrderID})`
    }   
  }
}

const Fleet = React.createClass({
  render: function() {
    var fleetComponents = fleetList.map(function(fleet, idx) {
      return (
        <div key={idx} onClick={this.props.chooseFleet.bind(null, fleet.FleetManagerID)} 
          className={fleet.FleetManagerID === this.props.selectedFleet ? styles.vendorInformationSelected : styles.vendorInformation }>
          <div className={styles.maskInput}>
            <img src={fleet.FleetManagerID === this.props.selectedFleet ? "/img/icon-radio-on.png" : "/img/icon-radio-off.png"} />
          </div>
          <div className={styles.maskName}>
            <span className={styles.vendorName}>
              {fleet.FleetManager && fleet.FleetManager.CompanyDetail && fleet.FleetManager.CompanyDetail.CompanyName}
            </span>
          </div>
          <div className={styles.maskLoad}>
            <img className={styles.vendorLoadImage} src="/img/icon-grouping.png" />
            <span className={styles.vendorLoad}>
              {fleet.CurrentLoad} / {fleet.FleetManager && fleet.FleetManager.CompanyDetail.OrderVolumeLimit} kg
            </span>
          </div>
        </div>
      );
    }.bind(this));
    return <div>{fleetComponents}</div>;
  }
});

export const AssignVendor = React.createClass({
  getInitialState() {
    return ({
      selectedFleet: selectedFleet
    });
  },
  chooseFleet(id) {
    selectedFleet = id;
    this.setState({selectedFleet: id});
  },
  render() {
    return (
      <div>
        <div className={styles.mainAssignBox}>
          <div>
            <div className={styles.modalDesc}>
              <div className={styles.mainLabelWebstore}>
                {this.props.trip.ListWebstoreMores}
              </div>
              <div className={styles.secondLabel}>
                {this.props.trip.PickupAddress && this.props.trip.PickupAddress.City}
              </div>
            </div>
            <div className={styles.borderDesc} />
            <div className={styles.modalDesc2}>
              <div className={styles.secondLabel}>
                Total Weight
              </div>
              <div className={styles.mainLabel}>
                {this.props.trip.Weight} kg
              </div>                    
            </div>
            <div className={styles.borderDesc} />
            <div className={styles.modalDesc3}>
              <div className={styles.secondLabel}>
                Quantity
              </div>
              <div className={styles.mainLabel}>
                {this.props.trip.UserOrderRoutes.length}
              </div>                    
            </div>
            <div className={styles.borderDesc} />
            <div className={styles.modalDesc4}>
              <div className={styles.secondLabel}>
                Please choose a vendor that you want to assign with this trip.
              </div>               
            </div>
          </div>
          <div style={{clear: 'both'}} />
        </div>
        <div className={styles.vendorList}>
          { fleetList.length > 0 &&
            <div>
              <Fleet chooseFleet={this.chooseFleet} selectedFleet={this.state.selectedFleet} />
            </div>
          }
          { fleetList.length === 0 &&
            <div className={styles.noTransportation}>
              No vendor found for this trip
            </div>
          }
        </div>
        <div>
          { !this.state.selectedFleet &&
            <div className={styles.notesBelow}>
              Please select a vendor for this trip and click on button to continue.
            </div>
          }
          { this.state.selectedFleet &&
            <div className={styles.notesBelow}>
              You have selected a vendor for this trip! Please click on this button to continue.
            </div>
          }
          <div>
            <button disabled={!this.state.selectedFleet} className={styles.buttonAssign} onClick={this.props.assignFleet}>Assign to Vendor</button>
          </div>
        </div>
      </div>
    );
  }
});

const Driver = React.createClass({
  render: function() {
    var driverComponents = driverList.map(function(driver, idx) {
      let rowStyle = styles.vendorInformation;
      if (this.props.selectedVehicle === 'Van' && driver.Vehicle.VehicleID === config.vehicleType.Motorcycle) {
        rowStyle = styles.vendorInformationNone;
      }
      if (this.props.selectedVehicle === 'Motorcycle' && driver.Vehicle.VehicleID !== config.vehicleType.Motorcycle) {
        rowStyle = styles.vendorInformationNone;
      }
      if (driver.UserID === this.props.selectedDriver) {
        rowStyle = styles.vendorInformationSelected;
      }
      return (
        <div key={driver.UserID} onClick={this.props.chooseDriver.bind(null, driver.UserID)} className={rowStyle}>
          <div className={styles.driverInput}>
            <img src={driver.UserID === this.props.selectedDriver ? "/img/icon-radio-on.png" : "/img/icon-radio-off.png"} />
          </div>
          <div className={styles.driverPicture}>
            <img src={driver.Vehicle && driver.Vehicle.VehicleID === config.vehicleType.Motorcycle ? 
              "/img/icon-vehicle-motorcycle.png" : "/img/icon-vehicle-van.png"} />
          </div>
          <table className={styles.driverMaskName}>
            <tr>
              <span className={styles.driverName}>{driver.FirstName} {driver.LastName}</span>
            </tr>
            <tr>
              <span className={styles.driverWeight}>Available Weight: {driver.CurrentWeight}/
                {driver.Vehicle && driver.Vehicle.VehicleID === config.vehicleType.Motorcycle 
                ? config.motorcycleMaxWeight : config.vanMaxWeight} kg</span>
            </tr>
          </table>
          <table className={styles.driverLocation}>
            <tr>
              From Pickup Location
            </tr>
            <tr className={styles.driverMaskLoad}>
              <img className={styles.vendorLoadImage} src="/img/icon-location.png" />
              <span className={styles.vendorLoad}>{driver.DistanceToNearestPickup || 'N/A'} km</span>
            </tr>
          </table>
        </div>
      );
    }.bind(this));
    return <div>{driverComponents}</div>;
  }
});

export const AssignDriver = React.createClass({
  getInitialState() {
    return ({
      selectedVehicle: 'Motorcycle',
      allowNoSeparate: false,
      selectedDriver: selectedDriver,
    });
  },
  chooseVehicle(vehicle) {
    this.setState({selectedVehicle: vehicle.value});
  },
  noSeparate() {
    this.setState({allowNoSeparate: true});
  },
  chooseDriver(id) {
    selectedDriver = id;
    this.setState({selectedDriver: id});
  },
  render() {
    const vehicleList = config.vehicle;

    return (
      <div>
        <div className={styles.mainAssignBox}>
          <div>
            <div className={styles.modalDesc}>
              <div className={styles.mainLabelWebstore}>
                {this.props.trip.ListWebstoreMores}
              </div>
              <div className={styles.secondLabel}>
                {this.props.trip.PickupAddress && this.props.trip.PickupAddress.City}
              </div>
            </div>
            <div className={styles.borderDesc} />
            <div className={styles.modalDesc2}>
              <div className={styles.secondLabel}>
                Total Weight
              </div>
              <div className={styles.mainLabel}>
                {this.props.trip.Weight} kg
              </div>                    
            </div>
            <div className={styles.borderDesc} />
            <div className={styles.modalDesc3}>
              <div className={styles.secondLabel}>
                Quantity
              </div>
              <div className={styles.mainLabel}>                
                {this.props.trip.UserOrderRoutes && this.props.trip.UserOrderRoutes.length}
              </div>                    
            </div>
            <div className={styles.borderDesc} />
            <div className={styles.modalDesc4}>
              <div className={styles.secondLabel}>
                Vehicle
              </div>
              <div className={styles.secondLabelVehicle}>              
                <DropdownTypeAhead options={vehicleList} selectVal={this.chooseVehicle} val={this.state.selectedVehicle} />
              </div>            
            </div>
          </div>
          <div style={{clear: 'both'}} />
          { this.props.trip.Weight > config.motorcycleMaxWeight && this.state.selectedVehicle === 'Motorcycle' 
            && !this.state.allowNoSeparate &&
              <div className={styles.modalDescBottom}>
                This trip is too big. Take {config.motorcycleMaxWeight} kg only and separate the rest?
                <div style={{clear: 'both'}} />
                <button className={styles.buttonSplitNo} onClick={this.noSeparate}>No</button>
                <button className={styles.buttonSplitYes} onClick={this.props.splitTrip}>Yes</button>
              </div>
          }
          <div style={{clear: 'both'}} />
        </div>
        <div className={styles.driverList}>
          { this.props.isFetchingDriver &&
            <div className={styles.searchingDriver}>
              <img className={styles.searchingIcon} src="/img/icon-search-color.png" />
              <br />
              <span className={styles.searchingSpan}>
                Searching....
              </span>
              <br />
              <div className={styles.searchingNotes}>
                We will search for the best driver suitable for the job, based on their location to the pickup location
              </div>
            </div>
          }
          { !this.props.isFetchingDriver && driverList.length > 0 &&
            <Driver selectedVehicle={this.state.selectedVehicle} noSplit={this.state.allowNoSeparate} 
              chooseDriver={this.chooseDriver} selectedDriver={this.state.selectedDriver} />
          }
          { !this.props.isFetchingDriver && driverList.length === 0 &&
            <div className={styles.noTransportation}>
              No driver found for this trip
            </div>
          }
        </div>
        <div>
          { this.props.trip.Weight > config.motorcycleMaxWeight && this.state.selectedVehicle === 'Motorcycle' 
            && !this.state.allowNoSeparate &&
            <div className={styles.notesBelow}>
              Please choose if you want to divide this trip or not before you can continue
            </div>
          }
          <div>
            <button disabled={!this.state.selectedDriver} className={styles.buttonAssign} onClick={this.props.assignDriver}>Assign to Driver</button>
          </div>
        </div>
      </div>
    );
  }
});

const OrderList = React.createClass({
  render: function() {
    var orderComponents = this.props.routes.map(function(route, idx) {
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
  getInitialState() {
    return ({
      showVendor: true,
      showDriver: false
    });
  },
  activateVendor() {
    this.setState({showVendor: true});
    this.setState({showDriver: false});
    selectedFleet = null;
    selectedDriver = null;
  },
  activateDriver() {
    this.setState({showVendor: false});
    this.setState({showDriver: true});
    selectedFleet = null;
    selectedDriver = null;
  },
  closeModal() {
    this.props.CloseModal();    
  },
  assignDriver() {
    if (!selectedDriver) {
      alert('Please select driver first');
      return;
    }
    this.props.DriverSet(this.props.trip.TripID, selectedDriver);
  },
  assignFleet() {
    if (!selectedFleet) {
      alert('Please select fleet first');
      return;
    }
    this.props.FleetSet(this.props.trip.TripID, selectedFleet);
  },
  splitTrip() {
    this.props.SplitTrip(this.props.trip.TripID);
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
      filters: filters,
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
          this.props.showModal &&
          <ModalContainer>
            <ModalDialog>
              <div>
                <div>
                  <div className={styles.modalTitle}>
                    Assign Trip
                  </div>
                  <div onClick={this.closeModal} className={styles.modalClose}>
                    X
                  </div> 
                  <div className={styles.toggleAssignMain}>
                    <div onClick={this.activateVendor} className={this.state.showVendor ? styles.toggleAssignActive : styles.toggleAssign}>Assign to Driver</div>
                    <div className={styles.arbitToggleAssign}> | </div>
                    <div onClick={this.activateDriver} className={this.state.showDriver ? styles.toggleAssignActive : styles.toggleAssign}>Assign to Vendor</div>
                  </div>
                  { this.state.showVendor &&
                    <AssignDriver trip={this.props.trip} assignDriver={this.assignDriver} 
                      splitTrip={this.splitTrip} isFetchingDriver={this.props.isFetchingDriver} />
                  }
                  {
                    this.state.showDriver &&
                    <AssignVendor trip={this.props.trip} assignFleet={this.assignFleet} />
                  }
                </div> 
              </div>
            </ModalDialog>
          </ModalContainer>
        }
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
                <div style={{clear: 'both'}} />
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
  const {pickupOrdersReady, driversStore} = state.app;
  const {isFetching, limit, total, currentPage, trips, filters, showDetails, tripActive, showModal, splitTrip, drivers, isFetchingDriver} = pickupOrdersReady;

  const {fleets} = state.app.nearbyFleets;
  fleetList = fleets;

  driverList = drivers;

  const {cities} = state.app.cityList;
  cities.forEach(function(city) {
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
    showDetails, 
    trip,
    showModal,
    isFetchingDriver
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
    },
    DriverSet(tripID, driverID) {
      dispatch(PickupOrdersReady.AssignDriver(tripID, driverID));
    },
    FleetSet(tripID, fleetID) {
      dispatch(PickupOrdersReady.AssignFleet(tripID, fleetID));
    },
    SplitTrip(id) {
      dispatch(PickupOrdersReady.SplitTrip(id));
    }
  };
}

export default connect(StateToProps, DispatchToProps)(TableStateful);