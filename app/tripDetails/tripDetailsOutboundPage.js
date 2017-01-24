import lodash from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import classNaming from 'classnames';
import moment from 'moment';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {ContainerDetailsActions, StatusList} from '../modules';
import districtsFetch from '../modules/districts/actions/districtsFetch';
import {ButtonBase, ButtonWithLoading, Input, Modal, Page, Glyph, DropdownTypeAhead} from '../views/base';
import DistrictAndDriver from '../views/container/districtAndDriver';
import {OrderTable} from './tripDetailsTable';
import * as TripDetails from './tripDetailsService';
import * as OutboundTrips from '../outboundTrips/outboundTripsService';
import AssignTripModal from '../outboundTrips/outboundTripsModal';
import ModalActions from '../modules/modals/actions';
import Accordion from '../views/base/accordion';
import RemarksSetter from '../components/remarksSetter';
import styles from './styles.css';
import {CanMarkContainer, CanMarkOrderReceived, CanMarkTripDelivered, TripParser} from '../modules/trips';
import {formatDate} from '../helper/time';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import config from '../config/configValues.json';
import ImagePreview from '../views/base/imagePreview';
import ImageUploader from '../views/base/imageUploader';
import {InputWithDefault} from '../views/base/input';
import DateTime from 'react-datetime';
import dateTimeStyles from '../views/container/datetime.css';
import DropdownMenu from 'react-dd-menu';

const columns = ['id', 'id2', 'dropoff', 'time', 'CODValue', 'CODStatus', 'orderStatus', 'routeStatus', 'action'];
const nonFillColumn = columns.slice(0, columns.length - 1);
const headers = [{
  id: 'EDS / WebOrderID', id2: 'Webstore',
  pickup: 'Pickup Address', dropoff: 'Recipient',
  time: 'Pickup Time', orderStatus: 'Order Status',routeStatus: 'Route Status', action: 'Action',
  CODValue: 'Value', CODStatus: 'COD'
}];

const DetailRow = React.createClass({
  generateTypeContent () {
    const {type, value, placeholder} = this.props

    switch (type) {
      case 'datetime' :
        return (
          <span className={styles.inputForm}>
            <span className={styles.datetimeWrapper}>
              <DateTime onChange={this.props.onChange} className={styles.inputForm} defaultValue={value}
                dateFormat='DD MMM YYYY' timeFormat='HH:mm:ss' viewMode='days' />
            </span>
          </span>
        )
      case 'image' :
        return (
          <div className={styles.imageUploaderWrapper}>
            <ImageUploader currentImageUrl={value} updateImageUrl={(data) => this.props.onChange(data)} />
          </div>
        )
      default :
        return (
          <div className={styles.inputForm}>
            <Input className={'form-control'} base={{placeholder: placeholder, defaultValue: value}}
              onChange={(data) => this.props.onChange(data)} type={type}/>
          </div>
        )
    }
  },
  render() {
    const {isEditing, label, type, value, className, placeholder} = this.props;
    return (
      <div className={className}>
        <div className={styles.inputLabel}>{label}</div>
        {
          !isEditing &&
          <span className={styles.inputForm}>
          {
            type === 'image'
            ? <ImagePreview imageUrl={value} />
            : value
          }
          </span>
        }
        {
          isEditing &&
          this.generateTypeContent()
        }
      </div>
    )
  }
});

const DetailPage = React.createClass({
  getInitialState() {
    return {
      showModal: false,
      showModalExternalTrip: false,
      driver: '', 
      district: {
        isChanging: false,
      },
      orderMarked: "",
      showVendor: true,
      showDriver: false,
      isMenuOpen: false
    };
  },
  toggle() {
    this.setState({ isMenuOpen: !this.state.isMenuOpen });
  },
  close() {
    this.setState({ isMenuOpen: false });
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
  },
  goToFillContainer() {
    const {trip} = this.props;
    this.props.goToFillContainer(trip.TripID);
  },
  pickDriver(val) {
    const driver = _.find(this.props.drivers, (driver) => (val == PrepareDriver(driver.Driver)));
    this.setState({driverID: driver.Driver.UserID, driver: val});
  },
  finalizeDriver() {
    this.props.driverPick(this.props.container.ContainerID,this.state.driverID);
  },
  deassignDriver() {
    if(confirm('Are you sure you want to cancel assignment on this trip?')) {
      this.props.driverDeassign();
    }
  },
  deassignFleet() {
    if(confirm('Are you sure you want to cancel assignment on this trip?')) {
      this.props.fleetDeassign();
    }
  },
  showAssignModal() {
    const {trip} = this.props;
    this.props.fetchListOnModal(trip.TripID);
  },
  openExternalTrip() {
    this.setState({showModalExternalTrip: true});
  },
  closeExternalTrip() {
    this.setState({showModalExternalTrip: false});
  },
  onChange(key) {
    return (val) => {
      this.props.update({[key]: val});
    }
  },
  saveEditThirdPartyLogistic() {
    this.props.saveEditThirdPartyLogistic();
  },
  changeMark(val) {
    this.setState({
      orderMarked: val,
    })
  },
  markReceived(val) {
    this.props.markReceived(val);
    this.setState({
      orderMarked: "",
    });
  },
  deliverTrip() {
    if(this.props.canMarkTripDelivered) {
      this.props.deliverTrip(this.props.trip.TripID);
    } else {
      this.props.askReuse({
        message: "Do you want to reuse the container?",
        action: this.props.reuse.bind(null, this.props.trip.TripID),
        cancel: this.props.deliverTrip.bind(null, this.props.trip.TripID),
      });
    }
  },
  exportManifest() {
    this.props.exportManifest();
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
  render() {
    const {activeDistrict, backToContainer, canDeassignDriver, canDeassignFleet, 
          container, districts, driverState, driversName, fillAble, hasDriver, 
          isFetching, isInbound, orders, reusable, statusList, TotalCODValue, 
          CODCount, totalDeliveryFee, trip, TotalWeight, isSaving3PL} = this.props;

    const {canMarkContainer, canMarkOrderReceived, canMarkTripDelivered, 
          isDeassigning, isChangingRemarks, isTripEditing} = this.props;

    const tripType = trip.DestinationHub ? 'INTERHUB' : 'LAST LEG';
    let tripDestination;
    if (trip.DestinationHub) {
      tripDestination = `Hub ${trip.DestinationHub.Name}`;
    } else if (trip.District) {
      tripDestination = `District ${trip.District.Name}`;
    } else {
      tripDestination = 'No Destination Yet';
    }

    let nextSuggestion = [];
    for (var p in trip.NextDestinationSuggestion) {
        if (trip.NextDestinationSuggestion.hasOwnProperty(p) && p !== 'NO_SUGGESTION') {
            nextSuggestion.push(p + ' (' + trip.NextDestinationSuggestion[p] + 
              (trip.NextDestinationSuggestion[p] > 1 ? ' orders' : ' order') + ')');
        }
    }

    let fleetSuggestion = [];
    if (trip.LastMileFleetSuggestion && trip.LastMileFleetSuggestion.length > 0) {
      fleetSuggestion = trip.LastMileFleetSuggestion.map((val) => {
        return {
          fleetID: val.UserID,
          companyName: val.CompanyDetail.CompanyName,
          capacity: val.OrderCapacity,
          ovl: val.CompanyDetail.OrderVolumeLimit
        }
      });
    }

    const canSet = trip.DestinationHub || trip.District;
    const haveSet = trip.Driver || trip.FleetManager || trip.ExternalTrip;

    const driverName = trip.Driver ? 
      trip.Driver.FirstName + ' ' + trip.Driver.LastName + ' | ' + trip.Driver.CountryCode + ' ' +trip.Driver.PhoneNumber : 'No Driver Yet';
    const companyName = trip.Driver && trip.Driver.Driver && trip.Driver.Driver.FleetManager && trip.Driver.Driver.FleetManager.CompanyDetail ? 
      trip.Driver.Driver.FleetManager.CompanyDetail.CompanyName : '';

    let menuOptions = {
      isOpen: this.state.isMenuOpen,
      close: this.close,
      toggle: <button type="button" className={styles.colMd12 + ' ' + styles.manifestLink + ' btn btn-md btn-default'} onClick={this.toggle}>
        Print Manifest
        <div className={styles.arrowDown} />
      </button>,
      align: 'right'
    };

    return (
      <div>
        {
          isFetching &&
          <h3>Fetching Trip Details...</h3>
        }
        {
          this.props.notFound && !isFetching &&
          <h3>Failed Fetching Container Details</h3>
        }
        {
          this.props.isAssigning &&
          <ModalContainer>
            <AssignTripModal />
          </ModalContainer>
        }
        {
          this.state.showModalExternalTrip &&
          <ModalContainer>
            <ModalDialog>
              <div>
                <div>
                  <div className={styles.modalTitle}>
                    Edit 3PL
                  </div>
                  <div onClick={this.closeExternalTrip} className={styles.modalClose}>
                    X
                  </div> 
                  <div>
                    <div className={'nb ' + styles.modalTabPanel}>
                      <div className="row">
                        <DetailRow label="3PL NAME" className={styles.colMd12 + ' ' + styles.detailRow} 
                          placeholder="Write the 3PL name here..." value={trip.ExternalTrip && trip.ExternalTrip.Sender} 
                          isEditing={true} type="text" onChange={this.onChange('Sender')} />
                        <DetailRow label="TRANSPORTATION" className={styles.colMd12 + ' ' + styles.detailRow} 
                          placeholder="Write the transportation here..." value={trip.ExternalTrip && trip.ExternalTrip.Transportation} 
                          isEditing={true} type="text" onChange={this.onChange('Transportation')} />
                        <DetailRow label="DEPARTURE TIME" className={styles.colMd6 + ' ' + styles.detailRow} 
                          value={trip.ExternalTrip && trip.ExternalTrip.DepartureTime && formatDate(trip.ExternalTrip.DepartureTime)} isEditing={true} type="datetime" onChange={this.onChange('DepartureTime')} />
                        <DetailRow label="ETA" className={styles.colMd6 + ' ' + styles.detailRow} 
                          value={trip.ExternalTrip && trip.ExternalTrip.ArrivalTime && formatDate(trip.ExternalTrip.ArrivalTime)} isEditing={true} type="datetime" onChange={this.onChange('ArrivalTime')} />
                        <DetailRow label="FEE" className={styles.colMd6 + ' ' + styles.detailRow} 
                          value={trip.ExternalTrip && trip.ExternalTrip.Fee} isEditing={true} type="number" onChange={this.onChange('Fee')} />
                        <DetailRow label="AWB NUMBER" className={styles.colMd6 + ' ' + styles.detailRow} 
                          value={trip.ExternalTrip && trip.ExternalTrip.AwbNumber} isEditing={true} type="text" 
                          onChange={this.onChange('AwbNumber')} />
                        <div className={styles.colMd12 + ' ' + styles.centerItems}>
                          <div className={styles.uploadButtonText + ' ' + styles.colMd2 + ' ' + styles.noPadding}>
                            { !trip.ExternalTrip && trip.ExternalTrip.PictureUrl &&
                              <p>Upload your receipt here</p>
                            }
                            { trip.ExternalTrip && trip.ExternalTrip.PictureUrl &&
                              <a href={trip.ExternalTrip && trip.ExternalTrip.PictureUrl} target="_blank">Uploaded</a>
                            }
                          </div>
                          <DetailRow className={styles.colMd10 + ' ' + styles.detailRow + ' ' + styles.uploadButton} 
                            value={trip.ExternalTrip && trip.ExternalTrip.PictureUrl} isEditing={true} type="image" onChange={this.onChange('PictureUrl')}/>
                        </div>
                      </div>
                      <div className={styles.mT30 + " pull-right"}>
                        <button className="btn btn-md btn-success" onClick={this.saveEditThirdPartyLogistic}>Save Changes</button>
                      </div>
                    </div>
                  </div>
                </div> 
              </div>
            </ModalDialog>
          </ModalContainer>
        }
        {
          !this.props.notFound && !isFetching &&
          <Page title={'Trip Details'} backButton="true">
            <div className={styles.mainDetails}>
              <div className="nb">
                <h3>#{'Trip-'+ trip.TripID} <span className={styles.orderStatus}>{trip.OrderStatus ? trip.OrderStatus.OrderStatus : ''}</span></h3>
              </div>
              <div className={styles.mB30 + ' ' + styles.displayFlex + ' nb'}>
                <div className={styles.colMd6 + ' ' + styles.noPadding}>
                  <RemarksSetter trip={trip} />
                </div>
                <div className={styles.colMd6}>
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
                      <p><Glyph name={'arrow-right'} className={styles.glyph} /> Outbound, {tripDestination}</p>
                    </div>
                    <div className={styles.colMd6}>
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
                            <div>
                              <p className={styles.title}>3PL : {trip.ExternalTrip.Sender + ' - ' + trip.ExternalTrip.Transportation + ' (' + trip.ExternalTrip.AwbNumber + ')'}</p>
                              <button className={styles.greenBtn + ' ' + styles.cancelButton} onClick={this.openExternalTrip}>Edit 3PL</button>
                            </div>
                          }
                        </div>
                        :
                        <div>
                          <p className={styles.title}>3PL / Fleet :</p>
                          <p>Not assigned yet</p>
                          <button className={styles.greenBtn + ' ' + styles.cancelButton} onClick={this.showAssignModal}>Assign Trip</button>
                        </div>
                      }
                      {
                        (canDeassignDriver || canDeassignFleet) &&
                        <ButtonWithLoading
                         styles={{base: styles.greenBtn + ' ' + styles.cancelButton}}
                         textBase="Cancel Assignment" 
                         textLoading="Deassigning" 
                         onClick={canDeassignDriver ? this.deassignDriver : this.deassignFleet} 
                         isLoading={isDeassigning} />
                      }
                    </div>
                  </div>
                  <div className={styles.colMd6 + ' ' + styles.noPadding}>
                    <div className={styles.colMd4 + ' '+ styles.actionButtoninside}>
                      {
                        reusable &&
                        <ButtonWithLoading styles={{base: styles.greenBtn}} textBase={'Clear and Reuse Container'} textLoading={'Clearing Container'} isLoading={emptying.isInProcess} onClick={this.clearContainer} />
                      }
                    </div>
                    <div className={styles.colMd4}>
                    </div>
                    <div className={styles.colMd4}>
                      <DropdownMenu {...menuOptions}>
                        <li>
                          <a href={'/trips/' + trip.TripID + '/manifest#'} className={styles.colMd12 + ' ' + styles.manifestLink + ' btn btn-md btn-default'} target="_blank">Detailed</a>
                        </li>
                        <li>
                          <a href={'/trips/' + trip.TripID + '/coverManifest#'} className={styles.colMd12 + ' ' + styles.manifestLink + ' btn btn-md btn-default'} target="_blank">Cover</a>
                        </li>
                        <li>
                          <a onClick={this.exportManifest} className={styles.colMd12 + ' ' + styles.manifestLink + ' btn btn-md btn-default'} target="_blank">Excel</a>
                        </li>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
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
              
              <span style={{display: 'block', marginTop: 10, marginBottom: 5}} className="nb">
                <span style={{display: 'inline-block', verticalAlign: 'middle'}}>
                  <label className={styles.title}>ORDERS IN THIS TRIP</label>
                </span>
                {
                  fillAble &&
                  <ButtonWithLoading textBase={'+ Add Order'} onClick={this.goToFillContainer} 
                    styles={{base: styles.normalBtn + ' ' + styles.addOrderBtn}} />
                }
              </span>
              {
                orders.length > 0 &&
                <div style={{position: 'relative'}}>
                  <OrderTable columns={fillAble ? columns : nonFillColumn} headers={headers} items={orders} statusList={statusList} />
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
  const {inboundTripDetails, outboundTripsService, userLogged} = state.app;
  const {hubID} = userLogged;
  const {isDeassigning, isFetching, orders: rawOrders, isChangingRemarks, isTripEditing, isSaving3PL} = inboundTripDetails;
  const {isAssigning} = outboundTripsService;
  const trip = ownProps.trip;
  const containerID = ownProps.params.id;
  const {containers, statusList} = state.app.containers;
  const container = containers[containerID];

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
      dropoff: Recipient ,
      time: order.PickupTime && formatDate(order.PickupTime),
      id3: order.UserOrderID,
      isDeleting: order.isRemoving,
      orderStatus: (order.OrderStatus && order.OrderStatus.OrderStatus) || '',
      routeStatus: order.Status,
      CODValue: order.IsCOD ? order.TotalValue : 0,
      DeliveryFee: order.DeliveryFee,
      tripID: trip.TripID,
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

  return {
    trip: TripParser(trip),
    orders: orders,
    container: container,
    isFetching: isFetching,
    fillAble: fillAble,
    reusable: reusable,
    emptying: emptying || {},
    canDeassignDriver: (trip.Driver && trip.OrderStatus.OrderStatusID == 2) || false,
    canDeassignFleet: (trip.FleetManager) || false,
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
    isChangingRemarks,
    isTripEditing,
    isSaving3PL,
    isAssigning
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
    fleetDeassign: function() {
      dispatch(TripDetails.DeassignFleet(ownProps.params.id));
    },
    goToFillContainer: function(id) {
      dispatch(push('/trips/' + id + '/fillReceived'));
    },
    fetchStatusList: function() {
      dispatch(StatusList.fetch());
    },
    markReceived: function(scannedID) {
      dispatch(TripDetails.OrderReceived(scannedID));
    },
    deliverTrip: function(tripID) {
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
    fetchListOnModal: (tripID) => {
      dispatch(OutboundTrips.FetchListNearbyDrivers(tripID));
      dispatch(OutboundTrips.FetchDetails(tripID));
      dispatch(OutboundTrips.FetchListNearbyFleets());
    },
    saveEditThirdPartyLogistic: () => {
      dispatch(TripDetails.SaveEdit3PL(ownProps.trip.TripID));
    },
    update: (externalTrip) => {
      dispatch(TripDetails.UpdateExternalTrip(externalTrip));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailPage);
