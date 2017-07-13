import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';
import NumberFormat from 'react-number-format';

import _ from 'lodash';
import PropTypes from 'prop-types';

import styles from './styles.scss';
import { Page } from '../views/base';
import OrderTable, { Filter, Deadline } from './orderTable';
import DragDropImageUploaderContainer from '../containers/DragDropImageUploaderContainer';
import { reasonReturn } from '../config/attempt.json';
import * as orderService from './orderMonitoringService';
import config from '../config/configValues.json';
import envConfig from '../../config.json';
import { InputWithDefault } from '../views/base/input';

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
      showSucceed: false,
      showPending: true,
      showFailed: false,
    };
  }

  componentWillMount() {
    this.props.fetchCount();
    this.props.fetchAllList();
  }

  getActiveTab() {
    const {
      showSucceed,
      showPending,
      showFailed,
    } = this.state;
    let active = '';

    if (showSucceed) { active = 'succeed'; }
    if (showPending) { active = 'pending'; }
    if (showFailed) { active = 'failed'; }

    return active;
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

  render() {
    const { succeedDelivery, pendingDelivery, failedDelivery } = this.props.count;
    const {
      PaginationAction,
      ExpandAttempt,
      HideOrder,
      ShowAttemptModal,
      PostAttempt,
      HideSucceedAttempt,
      isExpanded,
      expandedAttempt,
      paginationState,
      expandedOrder,
      modal,
      searchResult,
      succeedAttempt,
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

    const checkedOrders = _.filter(orders[this.getActiveTab()], { IsChecked: true });

    return (
      <Page title="Order Monitoring">
        {isExpanded &&
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
        {expandedAttempt &&
          <AttemptDetails
            expandedOrder={expandedOrder}
            hideAttempt={this.props.HideAttempt}
            defaultImg={config.IMAGES.DEFAULT_LOGO}
          />
        }
        {modal.addAttempt &&
          <AttemptModal hide={this.props.HideAttemptModal} submit={PostAttempt} />
        }
        {succeedAttempt &&
          <ModalContainer>
            <ModalDialog>
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>Success</h2>
                  <div className={`${styles.successContent} ${styles.ordersContentEmpty}`}>
                    <img className={styles.successIcon} src={config.IMAGES.ICON_SUCCESS} alt="success" />
                    <div className={styles.mediumText}>
                      You have successfully assigned the attempt
                    </div>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.endButton} onClick={HideSucceedAttempt}>
                    <span className={styles.mediumText}>Got It</span>
                  </button>
                </div>
              </div>
            </ModalDialog>
          </ModalContainer>
        }

        <div className={styles.widgetOuterContainer}>
          <div
            role="none"
            onClick={() => this.activatePending()}
            className={`${styles.widgetContainer}
            ${this.state.showPending ? styles.toggleWidgetActive : styles.toggleWidget}`}
          >
            <span className={styles.widgetTitle}>Total Pending Delivery</span>
            <span className={styles.total}>{pendingDelivery}</span>
          </div>
          <span className={styles.arbitTogglePickup}> | </span>
          <div
            role="none"
            onClick={() => this.activateSucceed()}
            className={`${styles.widgetContainer}
            ${this.state.showSucceed ? styles.toggleWidgetActive : styles.toggleWidget}`}
          >
            <span className={styles.widgetTitle}>Total Succeed Delivery</span>
            <span className={styles.total}>{succeedDelivery}</span>
          </div>
          <span className={styles.arbitTogglePickup}> | </span>
          <div
            role="none"
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
                pagination={{ PaginationAction, paginationState }}
                tab={this.getActiveTab()}
                showDelivery={ShowDeliveryModal}
                showUpdateCOD={ShowUpdateCODModal}
                orders={orders}
                checkedOrders={checkedOrders}
                searchResult={searchResult}
                hideOrder={HideOrder}
              />
            </div>
            <OrderTable tab={this.getActiveTab()} />
          </div>
        </div>

        {
          showDelivery &&
          <ModalDelivery
            DeliverOrder={DeliverOrder}
            checkedOrders={isExpanded ? [expandedOrder] : checkedOrders}
            HideDeliveryModal={HideDeliveryModal}
          />
        }

        {
          isSuccessDelivered &&
          <ModalDeliveryReport
            HideSuccessDelivery={HideSuccessDelivery}
            deliveryReport={deliveryReport}
          />
        }

        {
          showUpdateCOD &&
          <ModalUpdateCOD
            UpdateCODOrder={UpdateCODOrder}
            checkedOrders={isExpanded ? [expandedOrder] : checkedOrders}
            HideUpdateCODModal={HideUpdateCODModal}
          />
        }

        {
          isSuccessUpdateCOD &&
          <ModalUpdateCODReport
            HideSuccessUpdateCOD={HideSuccessUpdateCOD}
            updateCODReport={updateCODReport}
          />
        }

      </Page>
    );
  }
}

/* eslint-disable */
OrderMonitoringPage.propTypes = {
  fetchCount: PropTypes.func,
  fetchAllList: PropTypes.func,
  HideSucceedAttempt: PropTypes.any,
  searchResult: PropTypes.any,
  succeedAttempt: PropTypes.any,
  HideAttempt: PropTypes.func,
  HideAttemptModal: PropTypes.func,
};
/* eslint-enable */

OrderMonitoringPage.defaultProps = {
  fetchCount: () => {},
  fetchAllList: () => {},
  HideSucceedAttempt: {},
  searchResult: {},
  succeedAttempt: {},
  HideAttempt: () => {},
  HideAttemptModal: () => {},
};

function mapState(store) {
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
    searchResult,
    succeedAttempt,
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
    searchResult,
    succeedAttempt,
    orders,
    showDelivery,
    isSuccessDelivered,
    deliveryReport,
    showUpdateCOD,
    isSuccessUpdateCOD,
    updateCODReport,
  };
}

function mapDispatch(dispatch) {
  return {
    fetchCount: () => {
      dispatch(orderService.FetchCount());
    },
    fetchAllList: () => {
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
    HideSucceedAttempt: () => {
      dispatch(orderService.HideSucceedAttempt());
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
    },
  };
}

OrderMonitoringPage.propTypes = pagePropTypes;
OrderMonitoringPage.defaultProps = pageDefaultProps;

export default connect(mapState, mapDispatch)(OrderMonitoringPage);

const panelPropTypes = {
  expandAttempt: PropTypes.func.isRequired,
  expandedOrder: PropTypes.object.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  expandedAttempt: PropTypes.bool.isRequired,
  showAddAttemptModal: PropTypes.func,
  showDeliveryModal: PropTypes.func,
  hideOrder: PropTypes.func,
};

const panelDefaultProps = {
  expandAttempt: null,
  expandedOrder: {},
  isExpanded: false,
  expandedAttempt: false,
  showAddAttemptModal: () => {},
  showDeliveryModal: () => {},
  hideOrder: () => {},
};

class PanelDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
    };
  }

  showAddAttemptModal() {
    this.setState({ showMenu: false });
    this.props.showAddAttemptModal();
  }

  showDeliveryModal() {
    this.setState({ showMenu: false });
    this.props.showDeliveryModal();
  }

  showUpdateCODModal() {
    this.setState({ showMenu: false });
    this.props.showDeliveryModal();
  }

  toggleMenu() {
    this.setState({ showMenu: !this.state.showMenu });
  }

  reportAttemptDisabled(length, status) {
    return (
      (length < 2 && _.find(config.statusOptions.pending, { key: status.OrderStatusID }))
    );
  }

  render() {
    const { isExpanded, expandedAttempt, expandedOrder, expandAttempt } = this.props;
    const validUpdateCOD = expandedOrder.CODPaymentUserOrder &&
      expandedOrder.CODPaymentUserOrder.CODPayment &&
      expandedOrder.CODPaymentUserOrder.CODPayment.Status === 'Unpaid';

    return (
      <div>
        {isExpanded &&
          <div className={expandedAttempt ? styles.panelDetailsShiftLeft : styles.panelDetails}>
            <div
              role="none"
              className={styles.closeButton}
              onClick={this.props.hideOrder}
            >
              &times;
            </div>
            <div className={styles.orderDueTime}>
              <Deadline deadline={expandedOrder.DueTime} />
            </div>
            <div className={styles.menuOuterContainer}>
              <div role="none" onClick={() => this.toggleMenu()}>
                <img src={config.IMAGES.ICON_MENU} alt="menu" className={styles.iconMenu} />
              </div>
              {this.state.showMenu &&
                <ul className={styles.menuContainer}>
                  <li
                    className={(!_.includes(
                        config.deliverableOrderStatus,
                        expandedOrder.OrderStatus.OrderStatusID,
                      )) && styles.disabled}
                    onClick={() => this.showDeliveryModal()}
                  >
                    <img src={config.IMAGES.ICON_SUCCESS} alt="success" />
                    <p>Deliver Confirmation</p>
                  </li>
                  {envConfig.features.updateCODVendor &&
                    <li
                      className={!validUpdateCOD && styles.disabled}
                      onClick={() => this.showUpdateCODModal()}
                    >
                      <img alt="icon cod" src="/img/icon-cod-transfered.png" />
                      <p>COD Confirmation</p>
                    </li>
                  }
                  <li
                    className={
                      this.reportAttemptDisabled(
                        expandedOrder.UserOrderAttempts.length, expandedOrder.OrderStatus,
                      )
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
                {expandedOrder.IsCOD &&
                  <div className={styles.orderAdditionalInfo}>
                    <div className={styles.orderDetailsLabel}>
                      Payment Status
                    </div>
                    <div className={styles.orderDetailsValue}>
                      {!expandedOrder.CODPaymentUserOrder && 'No Payment Available'}
                      {expandedOrder.CODPaymentUserOrder &&
                        expandedOrder.CODPaymentUserOrder.CODPayment &&
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
    return (
      <ModalContainer>
        <ModalDialog className={styles.addAttemptModal}>
          <div>
            <div className={styles.addAttemptTitle}>
              Report Attempt
              <div role="none" className={styles.close} onClick={this.props.hide}>&times;</div>
            </div>
            <div className={styles.addAttemptBody}>
              <div className={styles.left}>
                Choose Reason <i className={styles.text_red}>*</i>
                <ul className={styles.reasons}>
                  {reasonReturn.map(reason => (
                    <Reason
                      {...reason}
                      key={reason.id}
                      className={(this.state.selected === reason.id) && styles.active}
                      onClick={() => this.selectReason(reason.id)}
                    />
                  ))}
                </ul>
              </div>
              <div className={styles.right}>
                Add Image (Optional)
                <DragDropImageUploaderContainer
                  updateImageUrl={data => this.setPicture(data)}
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
    );
  }
}

/* eslint-disable */
AttemptModal.propTypes = {
  submit: PropTypes.func,
};
/* eslint-enable */

AttemptModal.defaultProps = {
  submit: () => {},
};

function Reason({ img, text, className, onClick }) {
  return (
    <li className={className && className} onClick={onClick}>
      <img src={img} />
      <span>{text}</span>
    </li>
  );
}

/* eslint-disable */
Reason.propTypes = {
  img: PropTypes.any,
  text: PropTypes.any,
  className: PropTypes.any,
  onClick: PropTypes.func,
};
/* eslint-enable */

Reason.defaultProps = {
  img: {},
  text: {},
  className: {},
  onClick: () => {},
};

function AttemptDetails({ hideAttempt, expandedOrder, defaultImg }) {
  return (
    <div className={styles.attemptPanel}>
      <div role="none" className={styles.attemptHeader} onClick={hideAttempt}>
        <img src="/img/icon-previous.png" />
        {expandedOrder.UserOrderAttempts && expandedOrder.UserOrderAttempts.length} Attempt Details
        </div>
      <div className={styles.orderDetailsOuterContainer}>
        {expandedOrder.UserOrderAttempts &&
          expandedOrder.UserOrderAttempts.map((attempt, key) => (
            <div key={key} className={styles.attemptDetailContainer}>
              <div className={styles.attemptDetailHeader}>Attempt {key + 1}</div>
              <div className={styles.attemptDetailBody}>
                <div>
                  <img
                    className={styles.driverPict}
                    src={attempt.Driver && attempt.Driver.PictureUrl}
                    onError={(e) => { e.target.src = defaultImg; }}
                  />
                  <span className={styles.driverName}>
                    {attempt.Driver && `${attempt.Driver.FirstName} ${attempt.Driver.LastName}`}
                  </span>
                  <span className={styles.attemptDate}>
                    {(key === 0) ? 'First' : 'Second'} attempt on&nbsp;
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

/* eslint-disable */
AttemptDetails.propTypes = {
  hideAttempt: PropTypes.any,
  expandedOrder: PropTypes.any,
  defaultImg: PropTypes.any,
};
/* eslint-enable */

AttemptDetails.defaultProps = {
  hideAttempt: () => {},
  expandedOrder: {},
  defaultImg: {},
};

class InputForm extends Component {
  render() {
    const { value, label, onChange, type } = this.props;
    return (
      <div className={styles.rowDetailsMain}>
        <div className={styles.rowDetailsLabel}>
          {label}
        </div>
        <div className={styles.rowDetailsValue}>
          <span>
            <InputWithDefault type={type || 'text'} className={styles.inputDetails} currentText={value} onChange={onChange()} />
          </span>
        </div>
      </div>
    );
  }
}

/* eslint-disable */
InputForm.propTypes = {
  value: PropTypes.string,
  label: PropTypes.any,
  onChange: PropTypes.func,
  type: PropTypes.any,
};
/* eslint-enable */

InputForm.defaultProps = {
  value: '',
  label: {},
  onChange: () => {},
  type: {},
};

class ModalDelivery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      orderActive: null,
    };
  }

  setOrderActive(orderID) {
    this.setState({ orderActive: orderID });
  }

  stateChange(key, i) {
    return (value) => {
      const v = { [key]: value, UserOrderID: this.state.orderActive };
      const ordersSelected = this.state.orders;
      ordersSelected[i] = _.merge({}, ordersSelected[i], v);
      this.setState({ orders: ordersSelected });
    };
  }

  setPicture(url, i) {
    const v = { RecipientPhoto: url };
    const ordersSelected = this.state.orders;
    ordersSelected[i] = _.merge({}, ordersSelected[i], v);
    this.setState({ orders: ordersSelected });
  }

  confirmDelivery() {
    let incompleteData = false;
    if (this.state.orders.length !== this.props.checkedOrders.length) {
      incompleteData = true;
    }
    this.state.orders.forEach((order) => {
      if (!order.RecipientName || !order.RecipientRelation || !order.RecipientPhone) {
        incompleteData = true;
      }
    });
    if (incompleteData) {
      alert('Please complete all data');
      return;
    }
    delete this.state.orderActive;
    this.props.DeliverOrder(this.state);
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
              <div role="none" onClick={() => this.closeModal()} className={styles.modalClose}>
                &times;
              </div>
              <div className={styles.divider} />
              <div className={styles.listOrderDelivery}>
                <div>
                  {
                    this.props.checkedOrders.map((object, i) => {
                      if (this.state.orders[i]) {
                        this.state.orders[i].completed = false;
                      }
                      if (this.state.orders[i] && this.state.orders[i].RecipientName &&
                        this.state.orders[i].RecipientPhone &&
                        this.state.orders[i].RecipientRelation) {
                        this.state.orders[i].completed = true;
                      }
                      const orderClass = (this.state.orderActive === object.UserOrderID) ?
                        styles.orderDeliverySelected : styles.orderDelivery;
                      return (
                        <div
                          role="none"
                          className={orderClass}
                          onClick={() => this.setOrderActive(object.UserOrderID)}
                          key={i}
                        >
                          <img className={styles.imageOrderDelivery} src={config.IMAGES.ETOBEE_LOGO} />
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
                {this.state.orderActive &&
                  <div>
                    <div className={styles.notesDelivery}>
                      Please fill in the receiver details here
                    </div>
                    <div>
                      {
                        this.props.checkedOrders.map((object, i) => {
                          return (
                            <div key={i}>
                              {this.state.orderActive === object.UserOrderID &&
                                <div>
                                  <div className={styles.orderTitle}>
                                    Order: {object.UserOrderNumber}
                                  </div>
                                  <InputForm
                                    onChange={() => this.stateChange('RecipientName', i)}
                                    label={'Name'}
                                    value={this.state.orders[i] &&
                                      this.state.orders[i].RecipientName}
                                  />
                                  <InputForm
                                    onChange={() => this.stateChange('RecipientRelation', i)}
                                    label={'Relation'}
                                    value={this.state.orders[i] &&
                                      this.state.orders[i].RecipientRelation}
                                  />
                                  <InputForm
                                    onChange={() => this.stateChange('RecipientPhone', i)}
                                    label={'Phone Number'}
                                    value={this.state.orders[i] &&
                                      this.state.orders[i].RecipientPhone}
                                  />
                                  <div className={styles.imageNotesDelivery}>
                                    <DragDropImageUploaderContainer
                                      updateImageUrl={data => this.setPicture(data, i)}
                                      currentImageUrl={this.state.orders[i] &&
                                        this.state.orders[i].RecipientPhoto}
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
                  <button
                    onClick={() => this.confirmDelivery()}
                    className={styles.confirmButton}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </ModalDialog>
        </ModalContainer>
      </div>
    );
  }
}

/* eslint-disable */
ModalDelivery.propTypes = {
  checkedOrders: PropTypes.any,
  DeliverOrder: PropTypes.func,
  HideDeliveryModal: PropTypes.func,
};
/* eslint-enable */

ModalDelivery.defaultProps = {
  checkedOrders: {},
  DeliverOrder: () => {},
  HideDeliveryModal: () => {},
};

class ModalDeliveryReport extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  closeModal() {
    this.props.HideSuccessDelivery();
  }
  render() {
    const { deliveryReport } = this.props;
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
                      deliveryReport.errorIDs.map((error, idx) => {
                        return (
                          <div key={idx}>
                            Order {error.order.UserOrderID} : {error.error}
                          </div>
                        );
                      })
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
            {deliveryReport.errorIDs.length === 0 &&
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>Success</h2>
                  <div>
                    <img className={styles.successIcon} src={config.IMAGES.ICON_SUCCESS} />
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
    );
  }
}

/* eslint-disable */
ModalDeliveryReport.propTypes = {
  HideSuccessDelivery: PropTypes.func,
  deliveryReport: PropTypes.any,
};
/* eslint-enable */

ModalDeliveryReport.defaultProps = {
  HideSuccessDelivery: () => {},
  deliveryReport: {},
};

class ModalUpdateCOD extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ordersChecked: [],
      orderActive: null,
    };
  }

  stateChange(key) {
    const ordersSelected = this.state.ordersChecked;
    if (!_.includes(ordersSelected, key)) {
      ordersSelected.push(key);
    } else {
      const index = ordersSelected.indexOf(key);
      ordersSelected.splice(index, 1);
    }
    this.setState({ ordersSelected });
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
    this.setState({ orderActive: orderID });
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
              <div role="none" onClick={() => this.closeModal()} className={styles.modalClose}>
                &times;
              </div>
              <div className={styles.divider} />
              <div className={styles.listOrderUpdateCOD}>
                <div>
                  {
                    this.props.checkedOrders.map((object, i) => {
                      const orderClass = (this.state.orderActive === object.UserOrderID) ?
                        styles.orderDeliverySelected : styles.orderDelivery;
                      return (
                        <div
                          role="none"
                          className={orderClass}
                          onClick={() => this.setOrderActive(object.UserOrderID)}
                          key={i}
                        >
                          <img className={styles.imageOrderDelivery} src={config.IMAGES.ETOBEE_LOGO} />
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
                {this.state.orderActive &&
                  <div>
                    <div>
                      {
                        this.props.checkedOrders.map((object, i) => {
                          return (
                            <div key={i}>
                              {this.state.orderActive === object.UserOrderID &&
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
                                      value={object.TotalValue}
                                    />
                                  </div>
                                  <div className={styles.orderTitle}>
                                    <input
                                      checked={_.includes(this.state.ordersChecked, object.UserOrderID)}
                                      type="checkbox"
                                      onChange={() => this.stateChange(object.UserOrderID)}
                                    />
                                    I have received&nbsp;
                                      <NumberFormat
                                        displayType={'text'}
                                        thousandSeparator={'.'}
                                        decimalSeparator={','}
                                        prefix={'Rp '}
                                        value={object.TotalValue}
                                      />
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
                  <button onClick={() => this.confirmUpdate()} className={styles.confirmButton}>
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </ModalDialog>
        </ModalContainer>
      </div>
    );
  }
}

/* eslint-disable */
ModalUpdateCOD.propTypes = {
  UpdateCODOrder: PropTypes.func,
  HideUpdateCODModal: PropTypes.func,
  checkedOrders: PropTypes.any,
};
/* eslint-enable */

ModalUpdateCOD.defaultProps = {
  UpdateCODOrder: () => {},
  HideUpdateCODModal: () => {},
  checkedOrders: {},
};

class ModalUpdateCODReport extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  closeModal() {
    this.props.HideSuccessUpdateCOD();
  }
  render() {
    const { updateCODReport } = this.props;
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
                      updateCODReport.errorIDs.map((error, idx) => {
                        return (
                          <div key={idx}>{error.error}</div>
                        );
                      })
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
            {updateCODReport.errorIDs.length === 0 &&
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>Success</h2>
                  <div>
                    <img className={styles.successIcon} src={config.IMAGES.ICON_SUCCESS} />
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
    );
  }
}

/* eslint-disable */
ModalUpdateCODReport.propTypes = {
  HideSuccessUpdateCOD: PropTypes.func,
  updateCODReport: PropTypes.any,
};
/* eslint-enable */

ModalUpdateCODReport.defaultProps = {
  HideSuccessUpdateCOD: () => {},
  updateCODReport: {},
};
