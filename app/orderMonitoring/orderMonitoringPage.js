import React, { Component } from 'react';
import { connect } from 'react-redux';
import NumberFormat from 'react-number-format';
import styles from './styles.css';
import { ButtonWithLoading, Input, Page } from '../views/base';
import OrderTable, {Filter, Deadline} from './orderTable';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';
import DragDropImageUploader from '../components/dragDropImageUploader';
import { reasonReturn } from '../config/attempt.json';
import * as orderService from './orderMonitoringService';

class OrderMonitoringPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDelivery: true,
      showSucceed: false,
      showPending: false,
      showFailed: false,
    };
  }

  activateDelivery() {
    this.setState({
      showDelivery: true,
      showSucceed: false,
      showPending: false,
      showFailed: false
    });
  }

  activateSucceed() {
    this.setState({
      showDelivery: false,
      showSucceed: true,
      showPending: false,
      showFailed: false
    });
  }

  activatePending() {
    this.setState({
      showDelivery: false,
      showSucceed: false,
      showPending: true,
      showFailed: false
    });
  }

  activateFailed() {
    this.setState({
      showDelivery: false,
      showSucceed: false,
      showPending: false,
      showFailed: true
    });
  }

  getActiveTab() {
    const {
        showDelivery,
        showSucceed,
        showPending,
        showFailed
      } = this.state;

    if(showDelivery) {return 'total';}
    if(showSucceed) {return 'succeed';}
    if(showPending) {return 'pending';}
    if(showFailed) {return 'failed';}
  }

  componentWillMount() {
    this.props.FetchCount();
    this.props.FetchList('total');
    this.props.FetchList('succeed');
    this.props.FetchList('pending');
    this.props.FetchList('failed');
    if (!this.props.userLogged.hubID) {
      window.location.href = config.defaultMainPageTMS;
    }
  }

  render() {
    const { failedDelivery, pendingDelivery, succeedDelivery, totalDelivery } = this.props.count;
    const {
            PaginationAction,
            paginationState,
            isExpanded,
            expandedAttempt,
            expandedOrder,
            ExpandAttempt,
            HideOrder,
            ShowAttemptModal,
            PostAttempt,
            modal
          } = this.props;

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
            onClick={() => this.activateDelivery()}
            className={`${styles.widgetContainer}
            ${this.state.showDelivery ? styles.toggleWidgetActive : styles.toggleWidget}`}
          >
            <span className={styles.widgetTitle}>Total Delivery</span>
            <span className={styles.total}>{totalDelivery}</span>
          </div>
          <span className={styles.arbitTogglePickup}> | </span>
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
              <Filter pagination={{PaginationAction, paginationState}} tab={this.getActiveTab()} />
            </div>
            <OrderTable tab={this.getActiveTab()} />
          </div>
        </div>
      </Page>
    );
  }
}

function mapState(store, tab) {
  const { userLogged } = store.app;
  const { currentPage, limit, total, expandedOrder, isExpanded, expandedAttempt, count, modal } = store.app.orderMonitoring;

  return {
    userLogged,
    paginationState: {
        currentPage, limit, total,
    },
    isExpanded,
    expandedOrder,
    expandedAttempt,
    count,
    modal
  }
}

function mapDispatch(dispatch) {
  return {
    FetchCount: () => {
      dispatch(orderService.FetchCount());
    },
    FetchList: (tab) => {
      dispatch(orderService.FetchList(tab));
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
    }
  }
}

export default connect(mapState, mapDispatch)(OrderMonitoringPage)

class PanelDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMenu: false
    };
  }

  showAddAttemptModal() {
    this.setState({showMenu: false});
    this.props.showAddAttemptModal();
  }

  toggleMenu(){
    this.setState({showMenu: !this.state.showMenu});
  }

  render() {
    const { isExpanded, expandedAttempt, expandedOrder, expandAttempt } = this.props;

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
                  <li>
                    <img src="/img/icon-success.png" />
                    <p>Deliver Confirmation</p>
                  </li>
                  <li>
                    <img src="/img/icon-cod-transfered.png" />
                    <p>COD Confirmation</p>
                  </li>
                  <li
                    className={(expandedOrder.UserOrderAttempts.length > 1) && styles.disabled}
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

class AttemptModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      prove: null,
      selected: null
    };
  }

  setPicture(url) {
    this.setState({prove: url});
  }

  selectReason(key) {
    this.setState({selected: key});
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
                Choose Reason <i className={styles.text-red}>*</i>
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
                <button className={styles.sendReport} onClick={() => this.postAttempt()}>Send Report</button>
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
