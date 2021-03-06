import React from 'react';
import { connect } from 'react-redux';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';
import { push } from 'react-router-redux';

import * as _ from 'lodash';

import { ContainerDetailsActions, StatusList } from '../modules';
import { ButtonWithLoading, InputWithDefault, Page } from '../views/base';
import { OrderTable } from './tripDetailsTable';
import * as TripDetails from './tripDetailsService';
import ModalActions from '../modules/modals/actions';
import RemarksSetterContainer from '../containers/RemarksSetterContainer';
import styles from './styles.scss';
import { CanMarkContainer, CanMarkOrderReceived, CanMarkTripDelivered, TripParser } from '../modules/trips';
import { formatDate } from '../helper/time';
import ImagePreview from '../views/base/imagePreview';
import PickupOrdersModal from '../pickupOrders/pickupOrdersModal';
import * as PickupOrdersReady from '../pickupOrders//pickupOrdersReadyService';
import * as NearbyFleets from '../nearbyFleets/nearbyFleetService';
import { checkPermission } from '../helper/permission';
import Glyph from '../components/Glyph';

const columns = ['id', 'id2', 'pickup', 'time', 'CODValue', 'IsCOD', 'orderStatus', 'routeStatus', 'isSuccess', 'action'];
const nonFillColumn = columns.slice(0, columns.length - 1);
const headers = [{
  id: 'EDS / WebOrderID', id2: 'Webstore',
  pickup: 'Pickup Address', dropoff: 'Recipient',
  time: 'Pickup Time', orderStatus: 'Order Status', routeStatus: 'Route Status', action: 'Action',
  CODValue: 'Value', isSuccess: 'Scanned', CODStatus: 'COD', IsCOD: 'COD Status'
}];

const InputRow = React.createClass({
  getInitialState() {
    return {
      hover: false,
    };
  },
  onMouseEnterHandler: () => {
    this.setState({ hover: true });
  },
  onMouseLeaveHandler: () => {
    this.setState({ hover: false });
  },
  render() {
    const { label, value, type, icon, id } = this.props;
    const stylesLabel = styles.itemLabelHover;
    const stylesValue = styles.itemValueHover;

    return (
      <div className={styles['clear-both']}>
        <img className={styles.iconInput} src={`/img/${icon}.png`} />
        <span className={stylesLabel}>{label}</span>
        <InputWithDefault
          id={id}
          className={stylesValue}
          currentText={value}
          type={type}
          onChange={this.props.onChange}
        />
      </div>
    );
  },
});

const DetailRow = React.createClass({
  render() {
    const { isEditing, label, type, value, className, placeholder } = this.props;
    return (
      <div className={styles['clear-both']}>
        <span className={styles.itemLabel}>{label}</span>
        <span className={styles.itemValue}>
          {
            type === 'image' ?
              <ImagePreview imageUrl={value} />
              :
              value
          }
        </span>
      </div>
    );
  }
});

const DetailPage = React.createClass({
  getInitialState() {
    return {
      showModalExternalTrip: false,
      isMenuOpen: false,
    };
  },
  toggle() {
    this.setState({ isMenuOpen: !this.state.isMenuOpen });
  },
  openExternalTrip() {
    this.setState({ showModalExternalTrip: true });
  },
  closeExternalTrip() {
    this.setState({ showModalExternalTrip: false });
  },
  clearContainer() {
    if (confirm('Are you sure you want to empty and reuse this container?')) {
      this.setState({ showModal: true });
      this.props.clearContainer(this.props.container.ContainerID);
    }
  },
  componentWillMount() {
    this.props.fetchStatusList();
  },
  deassignDriver() {
    if (confirm('Are you sure you want to cancel assignment on this trip?')) {
      this.props.driverDeassign();
    }
  },
  deassignFleet() {
    if (confirm('Are you sure you want to cancel assignment on this trip?')) {
      this.props.fleetDeassign();
    }
  },
  exportManifest() {
    this.props.exportManifest();
  },
  goToFillContainer() {
    const { trip } = this.props;
    this.props.goToFillContainer(trip.TripID);
  },
  deliverTrip() {
    if (this.props.canMarkTripDelivered) {
      const scanned = _.reduce(this.props.orders, (sum, order) => {
        if (order.routeStatus === 'DELIVERED') {
          return sum + 1;
        } else {
          return sum;
        }
      }, 0);

      if (scanned < _.size(this.props.orders)) {
        let mark = confirm('You have scanned only ' + scanned + ' from ' + _.size(this.props.orders) +
          ' orders. Continue to mark this trip as delivered?');
        if (mark) {
          this.props.deliverTrip(this.props.trip.TripID);
        }
      } else {
        this.props.deliverTrip(this.props.trip.TripID);
      }
    } else {
      this.props.askReuse({
        message: 'Do you want to reuse the container?',
        action: this.props.reuse.bind(null, this.props.trip.TripID),
        cancel: this.props.deliverTrip.bind(null, this.props.trip.TripID),
      });
    }
  },
  stateChange(key) {
    return (value) => {
      this.setState({ [key]: value });
    };
  },
  onChange(key) {
    return (val) => {
      this.props.update({ [key]: val });
    };
  },
  render() {
    const { activeDistrict, backToContainer, canDeassignDriver, container,
      districts, driverState, driversName, fillAble, hasDriver, isFetching,
      isInbound, orders, reusable, statusList, TotalCODValue, CODCount,
      totalDeliveryFee, trip, TotalWeight } = this.props;

    const { canMarkContainer, canMarkOrderReceived, canMarkTripDelivered, isDeassigning,
      isEditing, scannedOrder, canDeassignFleet, userLogged } = this.props;

    let hasPermission = {
      add: true,
      completeTrip: true,
    };

    if (userLogged) {
      hasPermission = {
        add: checkPermission(userLogged, 'ADD_ORDER'),
        completeTrip: checkPermission(userLogged, 'COMPLETE_TRIP'),
      };
    }

    const successfullScan = _.filter(this.props.orders, { 'isSuccess': 'Yes' });

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
      `${trip.Driver.FirstName} ${trip.Driver.LastName} | ${trip.Driver.CountryCode} ${trip.Driver.PhoneNumber}` : 'No Driver Yet';

    const isInboundVal = true;

    return (
      <div>
        {
          isFetching &&
          <h3>Fetching Trip Details...</h3>
        }
        {
          this.state.showModalExternalTrip &&
          <ModalContainer>
            <ModalDialog>
              <div>
                <div>
                  <div className={styles.modalTitle}>
                    External Trip Details
                  </div>
                  <div onClick={this.closeExternalTrip} className={styles.modalClose}>
                    X
                  </div>
                  <div>
                    <div className={styles.modalTabPanel3pL}>
                      <div className="row">
                        <DetailRow label="3PL NAME" className={styles.colMd12 + ' ' + styles.detailRow} value={trip.ExternalTrip && trip.ExternalTrip.Sender} type='text' />
                        <DetailRow label="TRANSPORTATION" className={styles.colMd12 + ' ' + styles.detailRow} value={trip.ExternalTrip && trip.ExternalTrip.Transportation} type='text' />
                        <DetailRow label="DEPARTURE TIME" className={styles.colMd6 + ' ' + styles.detailRow} value={trip.ExternalTrip && trip.ExternalTrip.DepartureTime && formatDate(trip.ExternalTrip.DepartureTime)} type='datetime' />
                        <DetailRow label="ETA" className={styles.colMd6 + ' ' + styles.detailRow + ' ' + styles.detailRow} value={trip.ExternalTrip && trip.ExternalTrip.ArrivalTime && formatDate(trip.ExternalTrip.ArrivalTime)} type='datetime' />
                        <DetailRow label="FEE" className={styles.colMd6 + ' ' + styles.detailRow} value={trip.ExternalTrip && trip.ExternalTrip.Fee} type='number' />
                        <DetailRow label="AWB NUMBER" className={styles.colMd6 + ' ' + styles.detailRow} value={trip.ExternalTrip && trip.ExternalTrip.AwbNumber} type='text' />
                        <DetailRow label="IMAGE" className={styles.colMd6 + ' ' + styles.detailRow + ' ' + styles.uploadButton} value={trip.ExternalTrip && trip.ExternalTrip.PictureUrl} type='image' />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ModalDialog>
          </ModalContainer>
        }
        <PickupOrdersModal />
        {
          this.props.notFound && !isFetching &&
          <h3>Failed Fetching Container Details</h3>
        }
        {
          !this.props.notFound && !isFetching &&
          <Page title={'Trip Details'} backButton='true'>
            <div className={styles.mainDetails}>
              <div className='nb'>
                <span className={styles.tripID}>#{'TRIP-' + trip.TripID}
                  <span className={styles.orderStatus}>{trip.OrderStatus ? trip.OrderStatus.OrderStatus : ''}</span></span>
              </div>
              <div className={styles.mB30 + ' ' + styles.displayFlex + ' nb'}>
                <div className={styles.colMd6 + ' ' + styles.noPadding + ' ' + styles.margin20}>
                  <RemarksSetterContainer trip={trip} />
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
              <div className={styles['clear-both']} />
              <div className={styles.mB30 + ' nb'}>
                <div className="row">
                  <div className={styles.colMd6 + ' ' + styles.noPadding}>
                    <div className={styles.colMd6}>
                      <p className={styles.title}>{tripType}</p>
                      <p><Glyph name={'arrow-right'} className={styles.glyph} /> Inbound, {tripOrigin}</p>
                    </div>
                    <div className={styles.colMd6}>
                      {
                        haveSet ?
                          <div>
                            {
                              trip.FleetManager &&
                              <div>
                                <p className={styles.title}>
                                  Fleet : {trip.FleetManager.CompanyDetail &&
                                    trip.FleetManager.CompanyDetail.CompanyName}
                                </p>
                                {
                                  trip.Driver &&
                                  <p>{driverName}</p>
                                }
                              </div>
                            }
                            {
                              trip.ExternalTrip &&
                              <div>
                                <p className={styles.title}>
                                  3PL : {trip.ExternalTrip.Transportation}
                                </p>
                                <button
                                  className={styles.greenBtn}
                                  onClick={this.openExternalTrip}
                                >
                                  Show Details
                                </button>
                              </div>
                            }
                          </div>
                          :
                          <div>
                            <p className={styles.title}>
                              3PL / Fleet :
                            </p>
                            <p>Not assigned yet</p>
                            <button
                              className={styles.greenBtn}
                              onClick={this.props.showAssignModal}
                            >
                              Assign Trip
                            </button>
                          </div>
                      }
                      {
                        (canDeassignDriver || canDeassignFleet) &&
                        <ButtonWithLoading
                          styles={{ base: styles.greenBtn }}
                          textBase="Cancel Assignment"
                          textLoading="Deassigning"
                          onClick={canDeassignDriver ? this.deassignDriver : this.deassignFleet}
                          isLoading={isDeassigning} />
                      }
                    </div>
                  </div>
                  <div className={styles.colMd6 + ' ' + styles.noPadding}>
                    <div className={styles.colMd4}>
                    </div>
                    <div className={styles.colMd4 + ' ' + styles.actionButtoninside}>
                      {
                        reusable &&
                        <ButtonWithLoading styles={{ base: styles.greenBtn }} textBase={'Clear and Reuse Container'} textLoading={'Clearing Container'} isLoading={emptying.isInProcess} onClick={this.clearContainer} />
                      }
                      {
                        (canMarkTripDelivered || canMarkContainer) && hasPermission.completeTrip &&
                        <ButtonWithLoading styles={{ base: styles.greenBtn }} textBase={'Complete Trip'} textLoading={'Clearing Container'} isLoading={false} onClick={this.deliverTrip} />
                      }
                    </div>
                    <div className={styles.colMd4}>
                      <button type='button' className={styles.colMd12 + ' ' + styles.manifestLink + ' btn btn-md btn-default'} onClick={this.toggle}>
                        <div className={styles.manifestSpan}>Print Manifest</div>
                        <div className={this.state.isMenuOpen ? styles.arrowUp : styles.arrowDown} />
                      </button>
                      {this.state.isMenuOpen &&
                        <ul>
                          <li>
                            <a
                              href={`/trips/${trip.TripID}/manifest#`}
                              className={`${styles.colMd12} ${styles.manifestLink} btn btn-md btn-default`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Detailed
                            </a>
                          </li>
                          <li>
                            <a
                              href={`/trips/${trip.TripID}/coverManifest#`}
                              className={`${styles.colMd12} ${styles.manifestLink} btn btn-md btn-default`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Cover
                            </a>
                          </li>
                          <li>
                            <a
                              role="button"
                              onClick={this.exportManifest}
                              className={`${styles.colMd12}${styles.manifestLink} btn btn-md btn-default`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Excel
                            </a>
                          </li>
                        </ul>
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles['clear-both']} />
              <div className={styles.infoArea + ' ' + styles.mB30 + ' nb'}>
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
                  <span style={{ display: 'block', marginTop: 0, marginBottom: 20 }}>
                    <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                      <label className={styles.title}>ORDERS IN THIS TRIP</label>
                    </span>
                    {
                      hasPermission.add && fillAble &&
                      <ButtonWithLoading textBase={'+ Add Order'} onClick={this.goToFillContainer}
                        styles={{ base: styles.normalBtn + ' ' + styles.addOrderBtn }} />
                    }
                  </span>
                </div>
              </div>
              {
                orders.length > 0 &&
                <div style={{ position: 'relative' }}>
                  <OrderTable
                    isInbound={isInboundVal}
                    columns={fillAble ? columns : nonFillColumn}
                    headers={headers}
                    items={orders}
                    statusList={statusList}
                  />
                </div>
              }
            </div>
          </Page>
        }
      </div>
    );
  },
});

const mapStateToProps = (state, ownProps) => {
  const { tripDetails, userLogged, orderDetails } = state.app;
  const { hubID, isCentralHub } = userLogged;
  const { isDeassigning, isFetching, orders: rawOrders, isEditing, scannedOrder } = tripDetails;
  const trip = ownProps.trip;
  const isSuccessEditing = orderDetails.isSuccessEditing;
  const containerID = ownProps.params.id;
  const { containers, statusList } = state.app.containers;
  const container = containers[containerID];

  if (isFetching) {
    return { isFetching: true };
  }

  if (!trip) {
    return { notFound: true };
  }
  const emptying = false;
  const reusable = false;
  const fillAble = trip.OrderStatus && (trip.OrderStatus.OrderStatusID === 1 || trip.OrderStatus.OrderStatusID === 9);
  const uniqueOrders = _.uniqBy(rawOrders, 'UserOrderNumber');
  const containerOrders = _.map(trip.UserOrderRoutes, (route) => {
    return route;
  });

  var TotalWeight = 0;
  const orders = _.map(uniqueOrders, (order) => {
    const Recipient = order.RecipientName + '\n' + (order.DropoffAddress ? order.DropoffAddress.City + ' ' + order.DropoffAddress.ZipCode : '');
    TotalWeight += order.PackageWeight;

    return Object.assign({}, order, {
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
      IsCOD: order.IsCOD ? 'Yes' : 'No',
      CODStatus: (order.CODPaymentUserOrder && order.CODPaymentUserOrder.CODPayment) ?
        order.CODPaymentUserOrder.CODPayment.Status : 'No',
    });
  });

  const CODOrders = _.filter(orders, (order) => order.IsCOD === 'Yes');

  const routes = ownProps.routes;
  const paths = routes[2].path.split('/');
  const isInbound = paths[2] === 'inbound';

  return {
    trip: TripParser(trip),
    orders,
    container,
    isFetching,
    fillAble,
    reusable,
    emptying: emptying || {},
    canDeassignDriver: (trip.Driver && trip.OrderStatus.OrderStatusID == 2) || false,
    canDeassignFleet: (trip.FleetManager) || false,
    driverState: {
      isDeassigning: state.app.driversStore.driverDeassignment,
      isPicking: state.app.driversStore.driverList.isLoading,
    },
    statusList: _.chain(statusList)
      .map((key, val) => ({ key: key, value: val }))
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
    userLogged,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const route = ownProps.routes[ownProps.routes.length - 1];
  const path = route.path;

  return {
    backToContainer: () => {
      dispatch(push('/container'));
    },
    clearContainer: (id) => {
      dispatch(ContainerDetailsActions.clearContainer(id));
    },
    containerDetailsFetch: (id) => {
      dispatch(TripDetails.FetchDetails(id));
    },
    driverDeassign: () => {
      dispatch(TripDetails.Deassign(ownProps.params.id));
    },
    fleetDeassign: () => {
      dispatch(TripDetails.DeassignFleet(ownProps.params.id));
    },
    goToFillContainer: (id) => {
      dispatch(push(`/trips/${id}/fillPickup`));
    },
    fetchStatusList: () => {
      dispatch(StatusList.fetch());
    },
    markReceived: (scannedID, backElementFocusID, scanUpdateToggle) => {
      dispatch(TripDetails.OrderReceived(scannedID, backElementFocusID, scanUpdateToggle));
    },
    deliverTrip: (tripID) => {
      dispatch(TripDetails.TripDeliver(tripID));
    },
    askReuse: (modal) => {
      dispatch(ModalActions.addConfirmation(modal));
    },
    reuse: (tripID) => {
      dispatch(TripDetails.TripDeliver(tripID, true));
    },
    exportManifest: () => {
      dispatch(TripDetails.ExportManifest(ownProps.params.id));
    },
    UpdateOrder: (id, order) => {
      dispatch(TripDetails.editOrder(id, order, true));
    },
    StopEditOrder: () => {
      dispatch(TripDetails.StopEditOrder());
    },
    revertSuccessEditing: () => {
      dispatch(TripDetails.revertSuccessEditing());
    },
    showAssignModal: () => {
      dispatch(PickupOrdersReady.ShowAssignModal(parseInt(ownProps.params.id, 10)));
      dispatch(NearbyFleets.FetchList());
      dispatch(PickupOrdersReady.FetchDrivers(parseInt(ownProps.params.id, 10)));
    },
    update: (trip) => {
      dispatch(TripDetails.UpdateExternalTrip(trip));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailPage);
