import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import NumberFormat from 'react-number-format';

import styles from './styles.css';
import { Page } from '../views/base';
import OrderTable, {Filter, Deadline} from './orderTable';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';
import DragDropImageUploader from '../components/dragDropImageUploader';
import { reasonReturn } from '../config/attempt.json';
import { statusOptions } from '../config/configValues.json';
import * as orderService from './orderMonitoringService';
import config from '../config/configValues.json';
import envConfig from '../../config.json';
import {InputWithDefault} from '../views/base/input';

const pagePropTypes = {
  ExpandAttempt: PropTypes.func.isRequired,
  HideOrder: PropTypes.func.isRequired,
  ShowAttemptModal: PropTypes.func.isRequired,
  PostAttempt: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  expandedAttempt: PropTypes.bool.isRequired,
  PaginationAction: PropTypes.object.isRequired,
  count: PropTypes.any.isRequired,
  paginationState: PropTypes.any.isRequired,
  expandedOrder: PropTypes.any.isRequired,
  modal: PropTypes.any.isRequired,
  orders: PropTypes.any.isRequired,
  showDelivery: PropTypes.bool.isRequired,
  ShowDeliveryModal: PropTypes.func.isRequired,
  HideDeliveryModal: PropTypes.func.isRequired,
  DeliverOrder: PropTypes.func.isRequired,
  isSuccessDelivered: PropTypes.bool.isRequired,
  HideSuccessDelivery: PropTypes.func.isRequired,
  deliveryReport: PropTypes.object.isRequired,
  showUpdateCOD: PropTypes.bool.isRequired,
  ShowUpdateCODModal: PropTypes.func.isRequired,
  HideUpdateCODModal: PropTypes.func.isRequired,
  UpdateCODOrder: PropTypes.func.isRequired,
  isSuccessUpdateCOD: PropTypes.bool.isRequired,
  HideSuccessUpdateCOD: PropTypes.func.isRequired,
  updateCODReport: PropTypes.object.isRequired,
};

const pageDefaultProps = {
  ExpandAttempt: null,
  HideOrder: null,
  ShowAttemptModal: null,
  PostAttempt: null,
  isExpanded: false,
  expandedAttempt: false,
  PaginationAction: {},
  count: null,
  paginationState: null,
  expandedOrder: null,
  modal: null,
  orders: null,
  showDelivery: null,
  ShowDeliveryModal: null,
  HideDeliveryModal: null,
  DeliverOrder: null,
  isSuccessDelivered: null,
  HideSuccessDelivery: null,
  deliveryReport: null,
  showUpdateCOD: null,
  ShowUpdateCODModal: null,
  HideUpdateCODModal: null,
  UpdateCODOrder: null,
  isSuccessUpdateCOD: null,
  HideSuccessUpdateCOD: null,
  updateCODReport: null,
};

class OrderMonitoringPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSucceed: true,
      showPending: false,
      showFailed: false,
    };
  }

  componentWillMount() {
    this.props.FetchCount();
    this.props.FetchAllList();
    if (!this.props.userLogged.hubID) {
      window.location.href = config.defaultMainPageTMS;
    }
  }

  activateSucceed() {
    this.setState({
      showSucceed: true,
      showPending: false,
      showFailed: false,
    });
  }

  activatePending() {
    this.setState({
      showSucceed: false,
      showPending: true,
      showFailed: false,
    });
  }

  activateFailed() {
    this.setState({
      showSucceed: false,
      showPending: false,
      showFailed: true,
    });
  }

  getActiveTab() {
    const {
        showSucceed,
        showPending,
        showFailed,
      } = this.state;

    if(showSucceed) {return 'succeed';}
    if(showPending) {return 'pending';}
    if(showFailed) {return 'failed';}
  }

  render() {
    const { succeedDelivery, pendingDelivery, failedDelivery } = this.props.count;
    const {
            PaginationAction,
            ExpandAttempt,
            HideOrder,
            ShowAttemptModal,
            PostAttempt,
            isExpanded,
            expandedAttempt,
            paginationState,
            expandedOrder,
            modal,
            orders,
            showDelivery,
            ShowDeliveryModal,
            HideDeliveryModal,
            DeliverOrder,
            isSuccessDelivered,
            HideSuccessDelivery,
            deliveryReport,
            showUpdateCOD,
            ShowUpdateCODModal,
            HideUpdateCODModal,
            UpdateCODOrder,
            isSuccessUpdateCOD,
            HideSuccessUpdateCOD,
            updateCODReport,
          } = this.props;

    const checkedOrders = _.filter(orders[this.getActiveTab()], {IsChecked: true});

    return (
      <Page title="Order Monitoring">
        { isExpanded &&
          <PanelDetails
            isExpanded={isExpanded}
            expandedOrder={expandedOrder}
            hideOrder={HideOrder}
            expandedAttempt={expandedAttempt}
            expandAttempt={ExpandAttempt}
            showAddAttemptModal={ShowAttemptModal}
            showDeliveryModal={ShowDeliveryModal}
            showUpdateCODModal={ShowUpdateCODModal}
          />
        }
        { expandedAttempt &&
          <AttemptDetails expandedOrder={expandedOrder} hideAttempt={this.props.HideAttempt} />
        }
        { modal.addAttempt &&
          <AttemptModal hide={this.props.HideAttemptModal} submit={PostAttempt} />
        }
        <div className={styles.widgetOuterContainer}>
          <div
            onClick={() => this.activateSucceed()}
            className={`${styles.widgetContainer}
            ${this.state.showSucceed ? styles.toggleWidgetActive : styles.toggleWidget}`}
          >
            <span className={styles.widgetTitle}>Total Succeed Delivery</span>
            <span className={styles.total}>{succeedDelivery}</span>
          </div>
          <span className={styles.arbitTogglePickup}> | </span>
          <div
            onClick={() => this.activatePending()}
            className={`${styles.widgetContainer}
            ${this.state.showPending ? styles.toggleWidgetActive : styles.toggleWidget}`}
          >
            <span className={styles.widgetTitle}>Total Pending Delivery</span>
            <span className={styles.total}>{pendingDelivery}</span>
          </div>
          <span className={styles.arbitTogglePickup}> | </span>
          <div
            onClick={() => this.activateFailed()}
            className={`${styles.widgetContainer}
            ${this.state.showFailed ? styles.toggleWidgetActive : styles.toggleWidget}`}
          >
            <span className={styles.widgetTitle}>Total Failed Delivery</span>
            <span className={styles.total}>{failedDelivery}</span>
          </div>
        </div>

        <div className={styles.contentOuterContainer}>
          <div className={styles.contentContainer}>
            <div className={styles.mainTable}>
              <Filter 
                pagination={{PaginationAction, paginationState}} 
                tab={this.getActiveTab()}
                showDelivery={ShowDeliveryModal}
                showUpdateCOD={ShowUpdateCODModal}
                orders={orders}
                checkedOrders={checkedOrders}
                hideOrder={HideOrder}
              />
            </div>
            <OrderTable tab={this.getActiveTab()} />
          </div>
        </div>

        {
          showDelivery &&
          <ModalDelivery DeliverOrder={DeliverOrder} 
            checkedOrders={isExpanded ? [expandedOrder] : checkedOrders}
            HideDeliveryModal={HideDeliveryModal} 
          />
        }

        {
          isSuccessDelivered &&
          <ModalDeliveryReport HideSuccessDelivery={HideSuccessDelivery} deliveryReport={deliveryReport} />
        }

        {
          showUpdateCOD &&
          <ModalUpdateCOD UpdateCODOrder={UpdateCODOrder} 
            checkedOrders={isExpanded ? [expandedOrder] : checkedOrders} 
            HideUpdateCODModal={HideUpdateCODModal} />
        }

        {
          isSuccessUpdateCOD &&
          <ModalUpdateCODReport HideSuccessUpdateCOD={HideSuccessUpdateCOD} updateCODReport={updateCODReport} />
        }

      </Page>
    );
  }
}

function mapState(store, tab) {
  const { userLogged } = store.app;
  const { 
    currentPage, 
    limit, 
    total, 
    expandedOrder, 
    isExpanded, 
    expandedAttempt, 
    count, 
    modal,
    orders,
    showDelivery,
    isSuccessDelivered,
    deliveryReport,
    showUpdateCOD,
    isSuccessUpdateCOD,
    updateCODReport,
  } = store.app.orderMonitoring;

  return {
    userLogged,
    paginationState: {
        currentPage, limit, total,
    },
    isExpanded,
    expandedOrder,
    expandedAttempt,
    count,
    modal,
    orders,
    showDelivery,
    isSuccessDelivered,
    deliveryReport,
    showUpdateCOD,
    isSuccessUpdateCOD,
    updateCODReport,
  }
}

function mapDispatch(dispatch) {
  return {
    FetchCount: () => {
      dispatch(orderService.FetchCount());
    },
    FetchAllList: () => {
      dispatch(orderService.FetchAllList());
    },
    ExpandOrder: () => {
      dispatch(orderService.ExpandOrder());
    },
    HideOrder: () => {
      dispatch(orderService.HideOrder());
    },
    ExpandAttempt: () => {
      dispatch(orderService.ExpandAttempt());
    },
    HideAttempt: () => {
      dispatch(orderService.HideAttempt());
    },
    ShowAttemptModal: () => {
      dispatch(orderService.ShowAttemptModal());
    },
    HideAttemptModal: () => {
      dispatch(orderService.HideAttemptModal());
    },
    PaginationAction: {
      setCurrentPage: (currentPage, tab) => {
        dispatch(orderService.SetCurrentPage(currentPage, tab));
      },
      setLimit: (limit, tab) => {
        dispatch(orderService.SetLimit(limit, tab));
      },
    },
    PostAttempt: (reasonID, proof) => {
      dispatch(orderService.PostAttempt(reasonID, proof));
    },    
    ShowDeliveryModal: () => {
      dispatch(orderService.ShowDeliveryModal());
    },
    HideDeliveryModal: () => {
      dispatch(orderService.HideDeliveryModal());
    },
    DeliverOrder: (data) => {
      dispatch(orderService.DeliverOrder(data));
    },
    HideSuccessDelivery: () => {
      dispatch(orderService.HideSuccessDelivery());
    },
    ShowUpdateCODModal: () => {
      dispatch(orderService.ShowUpdateCODModal());
    },
    HideUpdateCODModal: () => {
      dispatch(orderService.HideUpdateCODModal());
    },
    UpdateCODOrder: (data) => {
      dispatch(orderService.UpdateCODOrder(data));
    },
    HideSuccessUpdateCOD: () => {
      dispatch(orderService.HideSuccessUpdateCOD());
    }
  }
}

OrderMonitoringPage.propTypes = pagePropTypes;
OrderMonitoringPage.defaultProps = pageDefaultProps;

export default connect(mapState, mapDispatch)(OrderMonitoringPage);

const panelPropTypes = {
  expandAttempt: PropTypes.func.isRequired,
  expandedOrder: PropTypes.object.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  expandedAttempt: PropTypes.bool.isRequired,
}

const panelDefaultProps = {
  expandAttempt: null,
  expandedOrder: {},
  isExpanded: false,
  expandedAttempt: false,
}

class PanelDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMenu: false
    };
  }

  showAddAttemptModal() {
    this.setState({ showMenu: false });
    this.props.showAddAttemptModal();
  }

  showDeliveryModal() {
    this.setState({showMenu: false});
    this.props.showDeliveryModal();
  }

  showUpdateCODModal() {
    this.setState({showMenu: false});
    this.props.showUpdateCODModal();
  }

  toggleMenu() {
    this.setState({ showMenu: !this.state.showMenu });
  }

  reportAttemptDisabled(length, status) {
    return (
        (length < 2 && _.find(statusOptions.pending, {key: status.OrderStatusID})) ? false : true
    );
  }

  render() {
    const { isExpanded, expandedAttempt, expandedOrder, expandAttempt } = this.props;
    const validUpdateCOD = expandedOrder.CODPaymentUserOrder && expandedOrder.CODPaymentUserOrder.CODPayment &&
      expandedOrder.CODPaymentUserOrder.CODPayment.Status === 'Unpaid';

    return (
      <div>
        { isExpanded &&
          <div className={expandedAttempt ? styles.panelDetailsShiftLeft : styles.panelDetails}>
            <div className={styles.closeButton} onClick={this.props.hideOrder}>
              &times;
            </div>
            <div className={styles.orderDueTime}>
              <Deadline deadline={expandedOrder.DueTime} />
            </div>
            <div className={styles.menuOuterContainer}>
              <img src="/img/icon-menu.png" className={styles.iconMenu} onClick={() => this.toggleMenu()}/>
              { this.state.showMenu &&
                <ul className={styles.menuContainer}>
                  <li className={(!_.includes(config.deliverableOrderStatus, expandedOrder.OrderStatus.OrderStatusID)) && styles.disabled}
                    onClick={() => this.showDeliveryModal()}>
                    <img src="/img/icon-success.png" />
                    <p>Deliver Confirmation</p>
                  </li>
                  { envConfig.features.updateCODVendor &&
                    <li className={!validUpdateCOD && styles.disabled}
                      onClick={() => this.showUpdateCODModal()}>
                      <img src="/img/icon-cod-transfered.png" />
                      <p>COD Confirmation</p>
                    </li>
                  }
                  <li
                    className={
                      this.reportAttemptDisabled(expandedOrder.UserOrderAttempts.length, expandedOrder.OrderStatus)
                      && styles.disabled
                    }
                    onClick={() => this.showAddAttemptModal()}
                  >
                    <img src="/img/icon-report-attempt.png" />
                    <p>Report Attempt</p>
                  </li>
                </ul>
              }
            </div>
            <div className={styles.orderDetails}>
              <button
                className={styles.orderAttemptBtn}
                onClick={expandAttempt}
              >
                <img src="/img/icon-alert.png" className={styles.left} />
                <span>{expandedOrder.UserOrderAttempts.length} Report Attempt</span>
                <img src="/img/icon-open.png" className={styles.right} />
              </button>
              <div className={styles.orderDetailsLabel}>
                Order Id
              </div>
              <div className={styles.orderDetailsValue}>
                {expandedOrder.UserOrderID}
              </div>
              <div className={styles.orderDetailsLabel}>
                Origin
              </div>
              <div className={styles.orderDetailsValue}>
                {expandedOrder.PickupAddress && expandedOrder.PickupAddress.City}
              </div>
              <div className={styles.orderDetailsLabel}>
                Destination
              </div>
              <div className={styles.orderDetailsValue}>
                {expandedOrder.DropoffAddress && expandedOrder.DropoffAddress.City}
              </div>
              <div>
                <div className={styles.orderAdditionalInfo}>
                  <div className={styles.orderDetailsLabel}>
                    Weight
                  </div>
                  <div className={styles.orderDetailsValue}>
                    {parseFloat(expandedOrder.PackageWeight).toFixed(2)} kg
                  </div>
                </div>
                <div className={styles.orderAdditionalInfo}>
                  <div className={styles.orderDetailsLabel}>
                    COD Type
                  </div>
                  <div className={styles.orderDetailsValue}>
                    {expandedOrder.IsCOD ? 'COD' : 'Non-COD'}
                  </div>
                </div>
                { expandedOrder.IsCOD &&
                  <div className={styles.orderAdditionalInfo}>
                    <div className={styles.orderDetailsLabel}>
                      Payment Status
                    </div>
                    <div className={styles.orderDetailsValue}>
                      {!expandedOrder.CODPaymentUserOrder && 'No Payment Available'}
                      {expandedOrder.CODPaymentUserOrder && expandedOrder.CODPaymentUserOrder.CODPayment &&
                        expandedOrder.CODPaymentUserOrder.CODPayment.Status}
                    </div>
                  </div>
                }
              </div>
            </div>
            <div className={styles.orderDetails}>
              <div className={styles.orderDetailsLabel}>
                From
              </div>
              <div className={styles.orderDetailsValue}>
                {expandedOrder.PickupAddress &&
                  `${expandedOrder.PickupAddress.FirstName} ${expandedOrder.PickupAddress.LastName}`
                }
              </div>
              <div className={styles.orderDetailsValue2}>
                {expandedOrder.PickupAddress && expandedOrder.PickupAddress.Address1}
              </div>
            </div>
            <div className={styles.orderDetails}>
              <div className={styles.orderDetailsLabel}>
                To
              </div>
              <div className={styles.orderDetailsValue}>
                {expandedOrder.DropoffAddress &&
                  `${expandedOrder.DropoffAddress.FirstName} ${expandedOrder.DropoffAddress.LastName}`
                }
              </div>
              <div className={styles.orderDetailsValue2}>
                {expandedOrder.DropoffAddress && expandedOrder.DropoffAddress.Address1}
              </div>
            </div>
            <div className={styles.orderValue}>
              <div className={styles.orderValueLabel}>
                Total Value
              </div>
              <div className={styles.orderTotalValue}>
                <NumberFormat
                  displayType={'text'}
                  thousandSeparator={'.'}
                  decimalSeparator={','}
                  prefix={'Rp '}
                  value={expandedOrder.TotalValue}
                />
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
}

PanelDetails.propTypes = panelPropTypes;
PanelDetails.defaultProps = panelDefaultProps;

class AttemptModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      prove: null,
      selected: null,
    };
  }

  setPicture(url) {
    this.setState({ prove: url });
  }

  selectReason(key) {
    this.setState({ selected: key });
  }

  postAttempt() {
    if (this.state.prove && this.state.selected) {
      this.props.submit(this.state.selected, this.state.prove);
    }
  }

  render() {

    return(
      <ModalContainer>
        <ModalDialog className={styles.addAttemptModal}>
          <div>
            <div className={styles.addAttemptTitle}>
              Report Attempt
              <div className={styles.close} onClick={this.props.hide}>&times;</div>
            </div>
            <div className={styles.addAttemptBody}>
              <div className={styles.left}>
                Choose Reason <i className={styles.text_red}>*</i>
                <ul className={styles.reasons}>
                  {reasonReturn.map((reason) => (
                    <Reason {...reason}
                      key={reason.id}
                      className={(this.state.selected == reason.id) && styles.active}
                      onClick={() => this.selectReason(reason.id)}
                    />
                  ))}
                </ul>
              </div>
              <div className={styles.right}>
                Add Image (Optional)
                <DragDropImageUploader
                  updateImageUrl={(data) => this.setPicture(data)}
                  currentImageUrl={this.state.prove}
                />
                <button 
                  className={styles.sendReport} 
                  onClick={() => this.postAttempt()}
                >
                  Send Report
                </button>
              </div>
            </div>
          </div>
        </ModalDialog>
      </ModalContainer>
    )
  }
}

function Reason({img, text, className, onClick}) {
  return (
    <li className={className && className} onClick={onClick}>
      <img src={img} />
      <span>{text}</span>
    </li>
  )
}

function AttemptDetails({hideAttempt, expandedOrder}) {
  return (
      <div className={styles.attemptPanel}>
        <div className={styles.attemptHeader} onClick={hideAttempt}>
          <img src="/img/icon-previous.png" />
          {expandedOrder.UserOrderAttempts.length} Attempt Details
        </div>
        <div className={styles.orderDetailsOuterContainer}>
        {expandedOrder.UserOrderAttempts.map((attempt, key) => (
          <div key={key} className={styles.attemptDetailContainer}>
            <div className={styles.attemptDetailHeader}>Attempt {key + 1}</div>
            <div className={styles.attemptDetailBody}>
              <div>
                <img className={styles.driverPict} src={attempt.Driver.PictureUrl} />
                <span className={styles.driverName}>
                  {attempt.Driver.FirstName} {attempt.Driver.LastName}
                </span>
                <span className={styles.attemptDate}>
                  {(key == 0) ? "First" : "Second"} attempt on
                  {new Date(attempt.CreatedDate).toDateString()}
                </span>
              </div>
              <div className={styles.reason}>
                Alasan
                <div className={styles.reasonDetail}>
                  <img src={reasonReturn[attempt.ReasonReturn.ReasonID - 1].img} />
                  <span>{reasonReturn[attempt.ReasonReturn.ReasonID - 1].text}</span>
                </div>
                <img className={styles.proof} src={attempt.ProofOfAttemptURL} />
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
  );
}

class InputForm extends Component {
  render() {
    const {value, label, onChange, type} = this.props;
    return (
      <div className={styles.rowDetailsMain}>
        <div className={styles.rowDetailsLabel}>
          {label}
        </div>
        <div className={styles.rowDetailsValue}>
          <span>
            <InputWithDefault type={type || 'text'} className={styles.inputDetails} currentText={value} onChange={onChange} />
          </span>
        </div>
      </div>
      )
  }
}

class ModalDelivery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      orderActive: null
    };
  }
  stateChange(key, i) {
    return (value) => {
      let v = {[key]: value, ['UserOrderID']: this.state.orderActive}
      let ordersSelected = this.state.orders;
      ordersSelected[i] = _.merge({}, ordersSelected[i], v);
      this.setState({['orders']: ordersSelected});
    };
  }
  confirmDelivery() {
    let incompleteData = false;
    if (this.state.orders.length !== this.props.checkedOrders.length) {
      incompleteData = true;
    }
    this.state.orders.forEach(function(order){
      if (!order.RecipientName || !order.RecipientRelation || !order.RecipientPhone) {
        incompleteData = true;
      }
    })
    if (incompleteData) {
      alert('Please complete all data');
      return;
    }
    delete this.state.orderActive;
    this.props.DeliverOrder(this.state);
  }
  setOrderActive(orderID) {
    this.setState({['orderActive']: orderID});
  }
  setPicture(url, i) {
    let v = {['RecipientPhoto']: url}
    let ordersSelected = this.state.orders;
    ordersSelected[i] = _.merge({}, ordersSelected[i], v);
    this.setState({['orders']: ordersSelected});
  }
  closeModal() {
    this.props.HideDeliveryModal();
  }
  render() {
    return (
      <div>
        <ModalContainer>
          <ModalDialog>
            <div className={styles.modalMain}>
              <div className={styles.modalTitle}>
                Delivery Confirmation
              </div>
              <div onClick={() => this.closeModal()} className={styles.modalClose}>
                X
              </div> 
              <div className={styles.divider} />
              <div className={styles.listOrderDelivery}>
                <div>
                  {
                    this.props.checkedOrders.map((object, i) => {
                      if (this.state.orders[i]) {
                        this.state.orders[i]['completed'] = false;
                      }
                      if (this.state.orders[i] && this.state.orders[i].RecipientName &&
                        this.state.orders[i].RecipientPhone && this.state.orders[i].RecipientRelation) {
                        this.state.orders[i]['completed'] = true;
                      }
                      const orderClass = (this.state.orderActive === object.UserOrderID) ?
                        styles.orderDeliverySelected : styles.orderDelivery;
                      return (
                        <div className={orderClass} onClick={() => this.setOrderActive(object.UserOrderID)} key={i}>
                          <img className={styles.imageOrderDelivery} src="/img/etobee-logo.png" />
                          <div className={styles.orderNumberDelivery}>
                            {object.UserOrderNumber} 
                            { 
                              (this.state.orders[i] && this.state.orders[i].completed) &&
                              <img src="/img/icon-ready.png" className={styles.iconCompleted} />
                            }
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
              <div className={styles.detailsOrderDelivery}>
                {
                  !this.state.orderActive && 
                  <div className={styles.notesDelivery}>
                    Please choose the order on the left
                  </div>
                }
                { this.state.orderActive && 
                  <div>
                    <div className={styles.notesDelivery}>
                      Please fill in the receiver details here
                    </div>
                    <div>
                      {
                        this.props.checkedOrders.map((object, i) => {
                          return (
                            <div key={i}>
                              { this.state.orderActive === object.UserOrderID &&
                                <div>
                                  <div className={styles.orderTitle}>
                                    Order: {object.UserOrderNumber}
                                  </div>
                                  <InputForm 
                                    onChange={this.stateChange('RecipientName', i).bind()} 
                                    label={'Name'} 
                                    value={this.state.orders[i] && this.state.orders[i].RecipientName} />
                                  <InputForm 
                                    onChange={this.stateChange('RecipientRelation', i).bind()} 
                                    label={'Relation'} 
                                    value={this.state.orders[i] && this.state.orders[i].RecipientRelation} />
                                  <InputForm 
                                    onChange={this.stateChange('RecipientPhone', i).bind()} 
                                    label={'Phone Number'} 
                                    value={this.state.orders[i] && this.state.orders[i].RecipientPhone}/>    
                                  <div className={styles.imageNotesDelivery}>
                                    <DragDropImageUploader
                                      updateImageUrl={(data) => this.setPicture(data, i)}
                                      currentImageUrl={this.state.orders[i] && this.state.orders[i].RecipientPhoto}
                                    />
                                  </div>
                                </div>
                              }
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                }
              </div>
              <div>
                <div>
                  <button onClick={() => this.confirmDelivery()} className={styles.confirmButton}>Confirm</button>
                </div>
              </div>
            </div> 
          </ModalDialog>
        </ModalContainer>
      </div>
    )
  }
}

class ModalDeliveryReport extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  closeModal() {
    this.props.HideSuccessDelivery();
  }
  render() {
    const {deliveryReport} = this.props;
    return (
      <div>
        <ModalContainer>
          <ModalDialog>
            {
              deliveryReport.errorIDs.length > 0 &&
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>Delivery Report</h2>
                  <div>
                    <div>
                      Success: {deliveryReport.successReport}
                    </div>
                    <div>
                      Error: {deliveryReport.errorReport}
                    </div>
                    {
                      deliveryReport.errorIDs.map(function(error, idx) {
                        return (
                          <div key={idx}>
                            Order {error.order.UserOrderID} : {error.error}
                          </div>
                        );
                      }.bind(this))
                    }
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.endButton} onClick={() => this.closeModal()}>
                    <span className={styles.mediumText}>Got It</span>
                  </button>
                </div>
              </div>
            }
            { deliveryReport.errorIDs.length === 0 &&
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>Success</h2>
                  <div>
                    <img className={styles.successIcon} src={"/img/icon-success.png"} />
                    <div className={styles.mediumText}>You have successfully set delivered</div>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.endButton} onClick={() => this.closeModal()}>
                    <span className={styles.mediumText}>Got It</span>
                  </button>
                </div>
              </div>
            }
          </ModalDialog>
        </ModalContainer>
      </div>
    )
  }
}

class ModalUpdateCOD extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ordersChecked: [],
      orderActive: null
    };    
  }
  stateChange(key) {
    let ordersSelected = this.state.ordersChecked;
    if (!_.includes(ordersSelected, key)) {
      ordersSelected.push(key)
    } else {
      var index = ordersSelected.indexOf(key);
      ordersSelected.splice(index, 1);
    }
    this.setState({['ordersChecked']: ordersSelected});
  }
  confirmUpdate() {
    let incompleteData = false;
    if (this.state.ordersChecked.length !== this.props.checkedOrders.length) {
      incompleteData = true;
    }
    if (incompleteData) {
      alert('Please complete all data');
      return;
    }
    delete this.state.orderActive;
    this.props.UpdateCODOrder(this.state);
  }
  setOrderActive(orderID) {
    this.setState({['orderActive']: orderID});
  }
  closeModal() {
    this.props.HideUpdateCODModal();
  }
  render() {
    return (
      <div>
        <ModalContainer>
          <ModalDialog>
            <div className={styles.modalMain}>
              <div className={styles.modalTitle}>
                Update COD Confirmation
              </div>
              <div onClick={() => this.closeModal()} className={styles.modalClose}>
                X
              </div> 
              <div className={styles.divider} />
              <div className={styles.listOrderUpdateCOD}>
                <div>
                  {
                    this.props.checkedOrders.map((object, i) => {
                      let orderClass = (this.state.orderActive === object.UserOrderID) ?
                        styles.orderDeliverySelected : styles.orderDelivery;
                      return (
                        <div className={orderClass} onClick={() => this.setOrderActive(object.UserOrderID)} key={i}>
                          <img className={styles.imageOrderDelivery} src="/img/etobee-logo.png" />
                          <div className={styles.orderNumberDelivery}>
                            {object.UserOrderNumber} 
                            { 
                              (_.includes(this.state.ordersChecked, object.UserOrderID)) &&
                              <img src="/img/icon-ready.png" className={styles.iconCompleted} />
                            }
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
              <div className={styles.detailsOrderUpdateCOD}>
                {
                  !this.state.orderActive && 
                  <div className={styles.notesDelivery}>
                    Please choose the order on the left
                  </div>
                }
                { this.state.orderActive && 
                  <div>
                    <div>
                      {
                        this.props.checkedOrders.map((object, i) => {
                          return (
                            <div key={i}>
                              { this.state.orderActive === object.UserOrderID &&
                                <div>
                                  <div className={styles.orderTitle}>
                                    Order: {object.UserOrderNumber}
                                  </div>
                                  <div className={styles.orderTitle}>
                                    COD Value: 
                                    <NumberFormat 
                                      displayType={'text'} 
                                      thousandSeparator={'.'} 
                                      decimalSeparator={','} 
                                      prefix={'Rp '} 
                                      value={object.TotalValue} />
                                  </div>
                                  <div className={styles.orderTitle}>
                                    <input checked={_.includes(this.state.ordersChecked, object.UserOrderID)} 
                                      type="checkbox" 
                                      onChange={() => this.stateChange(object.UserOrderID)} /> 
                                      I have received&nbsp; 
                                      <NumberFormat 
                                        displayType={'text'} 
                                        thousandSeparator={'.'} 
                                        decimalSeparator={','} 
                                        prefix={'Rp '} 
                                        value={object.TotalValue} />
                                      &nbsp;from driver.
                                  </div>
                                </div>
                              }
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                }
              </div>
              <div>
                <div>
                  <button onClick={() => this.confirmUpdate()} className={styles.confirmButton}>Confirm</button>
                </div>
              </div>
            </div> 
          </ModalDialog>
        </ModalContainer>
      </div>
    )
  }
}

class ModalUpdateCODReport extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  closeModal() {
    this.props.HideSuccessUpdateCOD();
  }
  render() {
    const {updateCODReport} = this.props;
    return (
      <div>
        <ModalContainer>
          <ModalDialog>
            {
              updateCODReport.errorIDs.length > 0 &&
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>Update COD Report</h2>
                  <div>
                    <div>
                      Success: {updateCODReport.successReport}
                    </div>
                    <div>
                      Error: {updateCODReport.errorReport}
                    </div>
                    {
                      updateCODReport.errorIDs.map(function(error, idx) {
                        return (
                          <div key={idx}>
                            {error.error}
                          </div>
                        );
                      }.bind(this))
                    }
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.endButton} onClick={() => this.closeModal()}>
                    <span className={styles.mediumText}>Got It</span>
                  </button>
                </div>
              </div>
            }
            { updateCODReport.errorIDs.length === 0 &&
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>Success</h2>
                  <div>
                    <img className={styles.successIcon} src={"/img/icon-success.png"} />
                    <div className={styles.mediumText}>You have successfully set COD status</div>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.endButton} onClick={() => this.closeModal()}>
                    <span className={styles.mediumText}>Got It</span>
                  </button>
                </div>
              </div>
            }
          </ModalDialog>
        </ModalContainer>
      </div>
    )
  }
}
