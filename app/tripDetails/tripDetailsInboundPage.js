import lodash from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import classNaming from 'classnames';
import moment from 'moment';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {ContainerDetailsActions, StatusList} from '../modules';
import districtsFetch from '../modules/districts/actions/districtsFetch';
import {ButtonBase, ButtonWithLoading, Input, InputWithDefault, Modal, Page, Glyph, DropdownTypeAhead} from '../views/base';
import {OrderTable} from './tripDetailsTable';
import * as TripDetails from './tripDetailsService';
import ModalActions from '../modules/modals/actions';
import Accordion from '../views/base/accordion';
import RemarksSetter from '../components/remarksSetter';
import styles from './styles.css';
import {CanMarkContainer, CanMarkOrderReceived, CanMarkTripDelivered, TripParser} from '../modules/trips';
import {formatDate} from '../helper/time';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import config from '../config/configValues.json';

const columns = ['id', 'id2', 'pickup', 'time', 'CODValue', 'CODStatus', 'orderStatus', 'routeStatus', 'isSuccess', 'action'];
const nonFillColumn = columns.slice(0, columns.length - 1);
const headers = [{
  id: 'EDS / WebOrderID', id2: 'Webstore',
  pickup: 'Pickup Address', dropoff: 'Recipient',
  time: 'Pickup Time', orderStatus: 'Order Status',routeStatus: 'Route Status', action: 'Action',
  CODValue: 'Value', isSuccess: 'Scanned', CODStatus: 'COD'
}];

let fleetList = [];
let driverList = [];
let cityList = {}; 
let selectedDriver = null;
let selectedDriverName = null;
let selectedFleet = null;
let selectedFleetName = null;
let isDriverExceed = false;
let isFleetExceed = false;
let selectedVehicleID = 1;

const InputRow = React.createClass({
  getInitialState() {
    return {
      hover: false
    };
  },
  onMouseEnterHandler: function() {
    this.setState({
      hover: true
    });
  },
  onMouseLeaveHandler: function() {
    this.setState({
      hover: false
    });
  },
  render() {
    const {isEditing, label, value, onChange, type, icon, id} = this.props;
    let stylesLabel = styles.itemLabelHover;
    let stylesValue = styles.itemValueHover;

    return (
      <div style={{clear: 'both'}} 
        className={styles.bgInput}>
        <img className={styles.iconInput} src={"/img/" + icon + ".png"} />
        <span className={stylesLabel}>{label}</span>
        <InputWithDefault id={id} className={stylesValue} currentText={value} type={type} onChange={this.props.onChange} />
      </div>
    );
  }
});


const Fleet = React.createClass({
  render: function() {
    var fleetComponents = fleetList.map(function(fleet, idx) {
      let vendorLoad = styles.vendorLoad;
      let availableLoad = fleet.CurrentLoad;
      let rowStyle = styles.vendorInformation;
      let capacity = fleet.FleetManager && fleet.FleetManager.CompanyDetail.OrderVolumeLimit;
      if (fleet.FleetManagerID === this.props.selectedFleet) {
        vendorLoad = styles.vendorLoadSelected;
        availableLoad = parseInt(availableLoad) + parseInt(this.props.sumOrders);
        rowStyle = styles.vendorInformationSelected;
        selectedFleetName = fleet.FleetManager && fleet.FleetManager.CompanyDetail && fleet.FleetManager.CompanyDetail.CompanyName;
        if (availableLoad > capacity) {
          vendorLoad = styles.vendorLoadSelectedExceed;
          rowStyle = styles.vendorInformationSelectedExceed;
          isFleetExceed = true;
        } else {
          isFleetExceed = false;
        }
      }
      return (
        <div key={idx} onClick={this.props.chooseFleet.bind(null, fleet.FleetManagerID)} 
          className={rowStyle}>
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
            <span className={vendorLoad}>
              {availableLoad} / {capacity}
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
              <Fleet chooseFleet={this.chooseFleet} selectedFleet={this.state.selectedFleet} sumOrders={this.props.trip.UserOrderRoutes.length} />
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
      let driverWeightStyle = styles.driverWeight;
      let availableWeight = driver.CurrentWeight;
      let capacity = driver.Vehicle && driver.Vehicle.VehicleID === config.vehicleType.Motorcycle 
        ? config.motorcycleMaxWeight : config.vanMaxWeight;
      if (driver.UserID === this.props.selectedDriver) {
        rowStyle = styles.vendorInformationSelected;
        driverWeightStyle = styles.driverWeightSelected;
        availableWeight = parseInt(availableWeight) + parseInt(this.props.weight);
        selectedDriverName = driver.FirstName + ' ' + driver.LastName;
        if (availableWeight > capacity) {
          driverWeightStyle = styles.driverWeightSelectedExceed;
          rowStyle = styles.vendorInformationSelectedExceed;
          isDriverExceed = true;
        } else {
          isDriverExceed = false;
        }
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
              <span className={driverWeightStyle}>Available Weight: {availableWeight}/{capacity} kg</span>
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
    selectedVehicleID = vehicle.key;
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
          { this.props.trip.Weight > config.vanMaxWeight && this.state.selectedVehicle === 'Van' 
            && !this.state.allowNoSeparate &&
              <div className={styles.modalDescBottom}>
                This trip is too big. Take {config.vanMaxWeight} kg only and separate the rest?
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
              chooseDriver={this.chooseDriver} selectedDriver={this.state.selectedDriver} weight={this.props.trip.Weight} />
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

const DetailPage = React.createClass({
  getInitialState() {
    return {
      showVendor: true,
      showDriver: false
    };
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
    this.props.hideAssignModal();
  },
  clearContainer() {
    if(confirm('Are you sure you want to empty and reuse this container?')) {
      this.setState({showModal: true});
      this.props.clearContainer(this.props.container.ContainerID);
    }
  },
  componentWillMount() {
    this.props.fetchStatusList();
    this.props.FetchFleetList();
  },
  deassignDriver() {
    if(confirm('Are you sure you want to deassign driver on this container?')) {
      this.props.driverDeassign();
    }
  },
  exportManifest() {
    this.props.exportManifest();
  },
  goToFillContainer() {
    const {trip} = this.props;
    this.props.goToFillContainer(trip.TripID);
  },
  deliverTrip() {
    if(this.props.canMarkTripDelivered) {
      let scanned = lodash.reduce(this.props.orders, function (sum, order) {
        if (order.routeStatus === 'DELIVERED') {
          return sum + 1;
        } else {
          return sum;
        }
      }, 0);

      if (scanned < lodash.size(this.props.orders)) {
        let mark = confirm('You have scanned only ' + scanned + ' from ' + lodash.size(this.props.orders) +
            ' orders. Continue to mark this trip as delivered?');
        if (mark) {
          this.props.deliverTrip(this.props.trip.TripID);
        }
      } else {
        this.props.deliverTrip(this.props.trip.TripID);
      }
    } else {
      this.props.askReuse({
        message: "Do you want to reuse the container?",
        action: this.props.reuse.bind(null, this.props.trip.TripID),
        cancel: this.props.deliverTrip.bind(null, this.props.trip.TripID),
      });
    }
  },
  stateChange(key) {
    return (value) => {
      this.setState({[key]: value});
    };
  },
  assignDriver() {
    if (!selectedDriver) {
      alert('Please select driver first');
      return;
    }
    if (isDriverExceed) {
      if (confirm('Are you sure you want to assign ' + this.props.trip.Weight + ' kg to ' + selectedDriverName + '?')) {
        this.props.DriverSet(this.props.trip.TripID, selectedDriver);
      } 
    } else {
      this.props.DriverSet(this.props.trip.TripID, selectedDriver);
    }
  },
  assignFleet() {
    if (!selectedFleet) {
      alert('Please select fleet first');
      return;
    }
    if (isFleetExceed) {
      if (confirm('Are you sure you want to assign ' + this.props.trip.Weight + ' kg to ' + selectedFleetName + '?')) {
        this.props.FleetSet(this.props.trip.TripID, selectedFleet);
      } 
    } else {
      this.props.FleetSet(this.props.trip.TripID, selectedFleet);
    }
  },
  splitTrip() {
    this.props.SplitTrip(this.props.trip.TripID, selectedVehicleID);
  },
  render() {
    const {activeDistrict, backToContainer, canDeassignDriver, container, districts, driverState, driversName, fillAble, hasDriver, isFetching, isInbound, orders, reusable, statusList, TotalCODValue, CODCount, totalDeliveryFee, trip, TotalWeight} = this.props;

    const {canMarkContainer, canMarkOrderReceived, canMarkTripDelivered, isDeassigning, isEditing, scannedOrder, canDeassignFleet} = this.props;

    const successfullScan = lodash.filter(this.props.orders, {'isSuccess': 'Yes'});

    const tripType = trip.OriginHub ? 'INTERHUB' : 'FIRST LEG';
    const tripOrigin = trip.OriginHub ? `Hub ${trip.OriginHub.Name}` : TripParser(trip).WebstoreNames;

    let statisticItem = '';
    if (!this.props.notFound && !isFetching && canDeassignDriver) {
      statisticItem = `Scanned ${successfullScan.length} of ${orders.length} items`;
    }
    if (!this.props.notFound && !isFetching && !canDeassignDriver) {
      statisticItem = `Total ${orders.length} items`;
    }

    const canSet = trip.DestinationHub || trip.District;
    const haveSet = trip.Driver || trip.FleetManager || trip.ExternalTrip;

    const driverName = trip.Driver ? 
      trip.Driver.FirstName + ' ' + trip.Driver.LastName + ' | ' + trip.Driver.CountryCode + ' ' +trip.Driver.PhoneNumber : 'No Driver Yet';
    const companyName = trip.Driver && trip.Driver.Driver && trip.Driver.Driver.FleetManager && trip.Driver.Driver.FleetManager.CompanyDetail ? 
      trip.Driver.Driver.FleetManager.CompanyDetail.CompanyName : '';

    return (
      <div>
        {
          isFetching &&
          <h3>Fetching Trip Details...</h3>
        }
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
          this.props.notFound && !isFetching &&
          <h3>Failed Fetching Container Details</h3>
        }
        {
          !this.props.notFound && !isFetching &&
          <Page title={'Trip Details'} backButton="true">
            <div className={styles.mainDetails}>
              <div className="nb">
                <span className={styles.tripID}>#{'TRIP-'+ trip.TripID} 
                <span className={styles.orderStatus}>{trip.OrderStatus ? trip.OrderStatus.OrderStatus : ''}</span></span>
              </div>
              <div className={styles.mB30 + ' ' + styles.displayFlex + ' nb'}>
                <div className={styles.colMd6 + ' ' + styles.noPadding + ' ' + styles.margin20}>
                  <RemarksSetter trip={trip} />
                </div>
                <div className={styles.colMd6 + ' ' + styles.margin20}>
                  {
                    trip.PickupTime &&
                    <p className={styles.title}>PICKUP TIME : {formatDate(trip.PickupTime)}</p>
                  }
                  {
                    trip.DropoffTime &&
                    <p className={styles.title}>DROPOFF TIME : {formatDate(trip.DropoffTime)}</p>
                  }
                </div>
              </div>
              <div style={{clear: 'both'}} />
              <div className={styles.mB30 + " nb"}>
                <div className="row">
                  <div className={styles.colMd6 + ' ' + styles.noPadding}>
                    <div className={styles.colMd6}>
                      <p className={styles.title}>{tripType}</p>
                      <p><Glyph name={'arrow-right'} className={styles.glyph} /> Inbound, {tripOrigin}</p>
                    </div>
                    <div className={styles.colMd6}>
                      {
                        (canDeassignDriver || canDeassignFleet) &&
                        <ButtonWithLoading styles={{base: styles.greenBtn}} textBase="Cancel Assignment" textLoading="Deassigning" onClick={this.deassignDriver} isLoading={isDeassigning} />
                      }
                      {
                        haveSet ?
                        <div>
                          {
                            trip.FleetManager &&
                            <div>
                              <p className={styles.title}>Fleet : {trip.FleetManager.CompanyDetail && trip.FleetManager.CompanyDetail.CompanyName}</p>
                              {
                                trip.Driver &&
                                <p>{driverName}</p>
                              }
                            </div>
                          }
                          {
                            trip.ExternalTrip &&
                            <p className={styles.title}>3PL : {trip.ExternalTrip.Transportation}</p>
                          }
                        </div>
                        :
                        <div>
                          <p className={styles.title}>3PL / Fleet :</p>
                          <p>No Driver Yet</p>
                          <button className={styles.greenBtn} onClick={this.props.showAssignModal}>Assign Trip</button>
                        </div>
                      }
                    </div>
                  </div>
                  <div className={styles.colMd6 + ' ' + styles.noPadding}>
                    <div className={styles.colMd4 + ' '+ styles.actionButtoninside}>
                      {
                        reusable &&
                        <ButtonWithLoading styles={{base: styles.greenBtn}} textBase={'Clear and Reuse Container'} textLoading={'Clearing Container'} isLoading={emptying.isInProcess} onClick={this.clearContainer} />
                      }
                      {
                        (canMarkTripDelivered || canMarkContainer) &&
                        <ButtonWithLoading styles={{base: styles.greenBtn}} textBase={'Complete Trip'} textLoading={'Clearing Container'} isLoading={false} onClick={this.deliverTrip} />
                      }
                    </div>
                    <div className={styles.colMd4}>
                      <a href={'/trips/' + trip.TripID + '/manifest#'} className={styles.colMd12 + ' ' + styles.manifestLink + ' btn btn-md btn-default'} target="_blank">Print Manifest</a>
                    </div>
                    <div className={styles.colMd4}>
                      <a onClick={this.exportManifest} className={styles.colMd12 + ' ' + styles.manifestLink + ' btn btn-md btn-default'} target="_blank">Excel Manifest</a>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{clear: 'both'}} />
              
                <div className={styles.infoArea + ' ' + styles.mB30 + " nb"}>
                  <div className={styles.colMd6 + ' ' + styles.noPadding + ' ' + styles.stats}>
                    <p className={styles.title}>STATS</p>
                    <div className={styles.colMd4 + ' ' + styles.noPadding}>
                      <h3>{TotalWeight}<small> Kg</small></h3>
                      <p>Weight</p>
                    </div>
                    <div className={styles.colMd4 + ' ' + styles.noPadding}>
                      <h3><small>#</small>{orders.length}</h3>
                      <p>Orders</p>
                    </div>
                    <div className={styles.colMd4 + ' ' + styles.noPadding}>
                      <h3><small>Rp </small>{totalDeliveryFee || 0}</h3>
                      <p>Delivery Fee</p>
                    </div>
                  </div>
                  <div className={styles.colMd1}>
                  </div>
                  <div className={styles.colMd5 + ' ' + styles.noPadding + ' ' + styles.cod}>
                    <p className={styles.title}>COD</p>
                    <div className={styles.colMd6 + ' ' + styles.noPadding}>
                      <h3><small>#</small>{CODCount}</h3>
                      <p>COD Orders</p>
                    </div>
                    <div className={styles.colMd6 + ' ' + styles.noPadding}>
                      <h3><small>Rp </small>{TotalCODValue}</h3>
                      <p>COD Value</p>
                    </div>
                  </div>
                </div>
              
              <div className={styles.displayFlex + ' nb'}>
                <div className={styles.colMd6 + ' ' + styles.noPadding}>
                  <span style={{display: 'block', marginTop: 0, marginBottom: 20}}>
                    <span style={{display: 'inline-block', verticalAlign: 'middle'}}>
                      <label className={styles.title}>ORDERS IN THIS TRIP</label>
                    </span>
                    {
                      fillAble &&
                      <ButtonWithLoading textBase={'+ Add Order'} onClick={this.goToFillContainer} 
                        styles={{base: styles.normalBtn + ' ' + styles.addOrderBtn}} />
                    }
                  </span>
                </div>
              </div>
              {
                orders.length > 0 &&
                <div style={{position: 'relative'}}>
                  <OrderTable isInbound={true} columns={fillAble ? columns : nonFillColumn} headers={headers} items={orders} statusList={statusList} />
                </div>
              }
            </div>
          </Page>
        }
      </div>
    );
  }
});

const mapStateToProps = (state, ownProps) => {
  const {tripDetails, userLogged, orderDetails} = state.app;
  const {hubID, isCentralHub} = userLogged;
  const {isDeassigning, isFetching, orders: rawOrders, isEditing, scannedOrder, showModal, fleets, drivers, isFetchingDriver} = tripDetails;
  const trip = ownProps.trip;
  const isSuccessEditing = orderDetails.isSuccessEditing;
  const containerID = ownProps.params.id;
  const {containers, statusList} = state.app.containers;
  const container = containers[containerID];

  fleetList = fleets;
  driverList = drivers;

  if(isFetching) {
    return {isFetching: true};
  }

  if(!trip) {
    return {notFound: true};
  }

  const emptying = false;
  const reusable = false;
  const fillAble = trip.OrderStatus && (trip.OrderStatus.OrderStatusID === 1 || trip.OrderStatus.OrderStatusID === 9);

  const containerOrders = lodash.map(trip.UserOrderRoutes, (route) => {
    return route;
  });

  // const orders = _.map(containerOrders, (order) => {
    // const order = route.UserOrder;

  var TotalWeight = 0;
  const orders = _.map(rawOrders, (order) => {
    const Recipient = order.RecipientName + '\n' + (order.DropoffAddress ? order.DropoffAddress.City + ' ' + order.DropoffAddress.ZipCode : '');
    TotalWeight += order.PackageWeight;

    return {
      id: `${order.UserOrderNumber} (${order.WebOrderID})`,
      id2: order.User.FirstName + ' ' + order.User.LastName,
      pickup: order.PickupAddress && order.PickupAddress.Address1,
      dropoff: Recipient,
      time: order.PickupTime && formatDate(order.PickupTime),
      id3: order.UserOrderID,
      isDeleting: order.isRemoving,
      orderStatus: (order.OrderStatus && order.OrderStatus.OrderStatus) || '',
      routeStatus: order.Status,
      CODValue: order.IsCOD ? order.TotalValue : 0,
      DeliveryFee: order.DeliveryFee,
      tripID: trip.TripID,
      isSuccess: order.Status === 'DELIVERED' ? 'Yes' : 'No',
      CODStatus: (order.CODPaymentUserOrder && order.CODPaymentUserOrder.CODPayment) ?
                  order.CODPaymentUserOrder.CODPayment.Status : 'No'
    }
  });

  const CODOrders = _.filter(containerOrders, (order) => order.IsCOD);

  // if (!trip.ContainerNumber) {
  //   return {notFound: true, isFetching};
  // }

  const routes = ownProps.routes;
  const paths = routes[2].path.split('/');
  const isInbound = paths[2] === 'inbound';

  console.log('mark', CanMarkTripDelivered(trip, rawOrders), CanMarkContainer(trip, hubID));

  return {
    trip: TripParser(trip),
    orders: orders,
    container: container,
    isFetching: isFetching,
    fillAble: fillAble,
    reusable: reusable,
    emptying: emptying || {},
    canDeassignDriver: (trip.Driver && trip.OrderStatus.OrderStatusID == 2) || false,
    canDeassignFleet: (trip.FleetManager && trip.OrderStatus.OrderStatusID == 2) || false,
    driverState: {
      isDeassigning: state.app.driversStore.driverDeassignment,
      isPicking: state.app.driversStore.driverList.isLoading,
    },
    statusList: _.chain(statusList)
      .map((key, val) => ({key: key, value: val}))
      .sortBy((arr) => (arr.key))
      .value(),
    totalDeliveryFee: _.reduce(orders, (total, order) => {
      return total + order.DeliveryFee;
    }, 0),
    TotalCODValue: _.reduce(CODOrders, (sum, order) => sum + order.TotalValue, 0),
    TotalWeight: TotalWeight,
    CODCount: CODOrders.length,
    isInbound,

    isDeassigning,
    canMarkOrderReceived: CanMarkOrderReceived(trip, rawOrders),
    canMarkTripDelivered: CanMarkTripDelivered(trip, rawOrders),
    canMarkContainer: CanMarkContainer(trip, hubID),
    isEditing,
    scannedOrder,
    isSuccessEditing,
    isCentralHub,
    showModal,
    isFetchingDriver
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const route = ownProps.routes[ownProps.routes.length-1];
  const path = route.path;

  return {
    backToContainer: function() {
      dispatch(push('/container'));
    },
    clearContainer: function(id) {
      dispatch(ContainerDetailsActions.clearContainer(id));
    },
    containerDetailsFetch: function(id) {
      dispatch(TripDetails.FetchDetails(id));
    },
    driverDeassign: function() {
      dispatch(TripDetails.Deassign(ownProps.params.id));
    },
    goToFillContainer: function(id) {
      dispatch(push('/trips/' + id + '/fillPickup'));
    },
    fetchStatusList: function() {
      dispatch(StatusList.fetch());
    },
    markReceived: function(scannedID, backElementFocusID, scanUpdateToggle) {
      dispatch(TripDetails.OrderReceived(scannedID, backElementFocusID, scanUpdateToggle));
    },
    deliverTrip: function(tripID, orders) {
      dispatch(TripDetails.TripDeliver(tripID));
    },
    askReuse: function(modal) {
      dispatch(ModalActions.addConfirmation(modal));
    },
    reuse: function(tripID) {
      dispatch(TripDetails.TripDeliver(tripID, true));
    },
    exportManifest: function() {
      dispatch(TripDetails.ExportManifest(ownProps.params.id));
    },
    UpdateOrder: function(id, order){
      dispatch(TripDetails.editOrder(id, order, true));
    },
    StopEditOrder: function() {
      dispatch(TripDetails.StopEditOrder());
    },
    revertSuccessEditing: function(){
      dispatch(TripDetails.revertSuccessEditing());
    },
    showAssignModal: function() {
      dispatch(TripDetails.ShowAssignModal());
      dispatch(TripDetails.FetchDriverList());
    },
    hideAssignModal: function() {
      dispatch(TripDetails.HideAssignModal());
    },
    FetchFleetList: function() {
      dispatch(TripDetails.FetchFleetList());
    },
    DriverSet(tripID, driverID) {
      dispatch(TripDetails.AssignDriver(tripID, driverID));
    },
    FleetSet(tripID, fleetID) {
      dispatch(TripDetails.AssignFleet(tripID, fleetID));
    },
    SplitTrip(id, vehicleID) {
      dispatch(TripDetails.SplitTrip(id, vehicleID));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailPage);
