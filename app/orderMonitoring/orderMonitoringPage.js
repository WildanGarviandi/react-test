import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.css';
import { ButtonWithLoading, Input, Page } from '../views/base';
import OrderTable, {Filter, Deadline} from './orderTable';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';
import { DragoDropImageUploader as Dropzone } from '../views/base';
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

  componentWillMount() {
    this.props.FetchCount();
    this.props.FetchList();
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
          <AttemptDetails hideAttempt={this.props.HideAttempt} />
        }
        { modal.addAttempt &&
          <AttemptModal hide={this.props.HideAttemptModal} />
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
              { this.state.showDelivery &&
                <Filter pagination={{PaginationAction, paginationState}} />
              }
              {
                this.state.showSucceed &&
                <Filter pagination={{PaginationAction, paginationState}} />
              }
              {
                this.state.showPending &&
                <Filter pagination={{PaginationAction, paginationState}} />
              }
              {
                this.state.showFailed &&
                <Filter pagination={{PaginationAction, paginationState}} />
              }
            </div>
            { this.state.showDelivery &&
              <div>
                <OrderTable />
              </div>
            }
            {
              this.state.showSucceed &&
              <div>
                <OrderTable />
              </div>
            }
            {
              this.state.showPending &&
              <div>
                <OrderTable />
              </div>
            }
            {
              this.state.showFailed &&
              <div>
                <OrderTable />
              </div>
            }
          </div>
        </div>
      </Page>
    );
  }
}

function mapState(store) {
  const { userLogged } = store.app;
  const { currentPage, limit, total, expandedOrder, isExpanded, expandedAttempt, count, modal } = store.app.orderMonitoring

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
    FetchList: () => {
      dispatch(orderService.FetchList());
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
      setCurrentPage: (currentPage) => {
        dispatch(orderService.SetCurrentPage(currentPage));
      },
      setLimit: (limit) => {
        dispatch(orderService.SetLimit(limit));
      },
    },
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
                  <li onClick={() => this.showAddAttemptModal()}>
                    <img src="/img/icon-report-attempt.png" />
                    <p>Report Attempt</p>
                  </li>
                </ul>
              }
            </div>
            <div className={styles.orderDetails}>
              <button className={styles.orderAttemptBtn} onClick={expandAttempt} >
                <img src="/img/icon-alert.png" className={styles.left} />
                <span>2 Report Attempt</span>
                <img src="/img/icon-open.png" className={styles.right} />
              </button>
              <div className={styles.orderDetailsLabel}>
                Order Id
              </div>
              <div className={styles.orderDetailsValue}>
                &nbsp;
              </div>
              <div className={styles.orderDetailsLabel}>
                Origin
              </div>
              <div className={styles.orderDetailsValue}>
                &nbsp;
              </div>
              <div className={styles.orderDetailsLabel}>
                Destination
              </div>
              <div className={styles.orderDetailsValue}>
                &nbsp;
              </div>
              <div>
                <div className={styles.orderAdditionalInfo}>
                  <div className={styles.orderDetailsLabel}>
                    Weight
                  </div>
                  <div className={styles.orderDetailsValue}>
                    &nbsp;
                  </div>
                </div>
                <div className={styles.orderAdditionalInfo}>
                  <div className={styles.orderDetailsLabel}>
                    COD Type
                  </div>
                  <div className={styles.orderDetailsValue}>
                    &nbsp;
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.orderValue}>
              <div className={styles.orderValueLabel}>
                Total Value
              </div>
              <div className={styles.orderTotalValue}>
                &nbsp;
              </div>
            </div>
            <div className={styles.orderDetails}>
              <div className={styles.orderDetailsLabel}>
                From
              </div>
              <div className={styles.orderDetailsValue}>
                &nbsp;
              </div>
              <div className={styles.orderDetailsValue2}>
                &nbsp;
              </div>
            </div>
            <div className={styles.orderDetails}>
              <div className={styles.orderDetailsLabel}>
                To
              </div>
              <div className={styles.orderDetailsValue}>
                &nbsp;
              </div>
              <div className={styles.orderDetailsValue2}>
                &nbsp;
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
      ProfilePicture: '/img/photo-default.png'
    };
  }

  setPicture(url) {
    this.setState({ProfilePicture: url})
  }

  render() {
    return(
      <ModalContainer>
        <ModalDialog className={styles.addAttemptModal}>
          <div>
            <div className={styles.addAttemptTitle}>
              <div className={styles.attempt}>Attempt 1/2</div>
              Report Attempt
              <div className={styles.close} onClick={this.props.hide}>&times;</div>
            </div>
            <div className={styles.addAttemptBody}>
              <div className={styles.left}>
                Choose Reason <i style={{color: "#fc404e"}}>*</i>
                <ul className={styles.reasons}>
                  <li>
                    <img src="/img/icon-no-receiver.png" />
                    <span>Tidak ada orang</span>
                  </li>
                  <li>
                    <img src="/img/icon-reject.png" />
                    <span>Menolak kiriman</span>
                  </li>
                  <li>
                    <img src="/img/icon-cannot-pay.png" />
                    <span>Tidak bisa membayar</span>
                  </li>
                  <li>
                    <img src="/img/icon-late-delivery.png" />
                    <span>Pengiriman telat</span>
                  </li>
                  <li>
                    <img src="/img/icon-damage-package.png" />
                    <span>Paket rusak</span>
                  </li>
                  <li>
                    <img src="/img/icon-move-address.png" />
                    <span>Pindah alamat</span>
                  </li>
                  <li>
                    <img src="/img/icon-tidak-dikenal.png" />
                    <span>Tidak dikenal</span>
                  </li>
                  <li>
                    <img src="/img/icon-late-delivery.png" />
                    <span>Pengiriman telat</span>
                  </li>
                </ul>
              </div>
              <div className={styles.right}>
                Add Image (Optional)
                <Dropzone
                  updateImageUrl={(data) => this.setPicture(data)}
                />
                <button className={styles.sendReport}>Send Report</button>
              </div>
            </div>
          </div>
        </ModalDialog>
      </ModalContainer>
    )
  }
}

function AttemptDetails({hideAttempt}) {
  return(
      <div className={styles.attemptPanel}>
        <div className={styles.attemptHeader} onClick={hideAttempt}>
          <img src="/img/icon-previous.png" />
          2 Attempt Details
        </div>
        <div className={styles.orderDetails}>
          <div className={styles.orderDetailsLabel}>
            Attempts detail
          </div>
          <div className={styles.orderDetailsValue}>

          </div>
          <div className={styles.orderDetailsLabel}>
            Origin
          </div>
          <div className={styles.orderDetailsValue}>

          </div>
          <div className={styles.orderDetailsLabel}>
            Destination
          </div>
          <div className={styles.orderDetailsValue}>

          </div>
          <div>
            <div className={styles.orderAdditionalInfo}>
              <div className={styles.orderDetailsLabel}>
                Weight
              </div>
              <div className={styles.orderDetailsValue}>

              </div>
            </div>
            <div className={styles.orderAdditionalInfo}>
              <div className={styles.orderDetailsLabel}>
                COD Type
              </div>
              <div className={styles.orderDetailsValue}>

              </div>
            </div>
          </div>
        </div>
        <div className={styles.orderValue}>
          <div className={styles.orderValueLabel}>
            Total Value
          </div>
          <div className={styles.orderTotalValue}>

          </div>
        </div>
        <div className={styles.orderDetails}>
          <div className={styles.orderDetailsLabel}>
            From
          </div>
          <div className={styles.orderDetailsValue}>

          </div>
          <div className={styles.orderDetailsValue2}>

          </div>
        </div>
        <div className={styles.orderDetails}>
          <div className={styles.orderDetailsLabel}>
            To
          </div>
          <div className={styles.orderDetailsValue}>

          </div>
          <div className={styles.orderDetailsValue2}>

          </div>
        </div>
      </div>
  );
}
