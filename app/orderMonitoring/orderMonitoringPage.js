import React, { Component } from 'react';
import {connect} from 'react-redux';
import styles from './styles.css';
import {ButtonWithLoading, Input, Page} from '../views/base';
import OrderTable, {Filter} from './orderTable';
import * as orderService from './orderMonitoringService';

class OrderMonitoringPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDelivery: true,
      showSucceed: false,
      showPending: false,
      showFailed: false
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
    const { PaginationAction, paginationState, expandedOrder, expandedAttempt } = this.props;

    return (
      <Page title="Order Monitoring">
        { expandedOrder &&
          <PanelDetails
            expandedOrder={this.props.expandedOrder}
            hideOrder={this.props.HideOrder}
            expandedAttempt={this.props.expandedAttempt}
            expandAttempt={this.props.ExpandAttempt}
          />
        }
        { expandedAttempt &&
          <AttemptDetails hideAttempt={this.props.HideAttempt} />
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
  const { currentPage, limit, total, expandedOrder, expandedAttempt, count } = store.app.orderMonitoring

  return {
    userLogged,
    paginationState: {
        currentPage, limit, total,
    },
    expandedOrder,
    expandedAttempt,
    count
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
  render() {
    const { expandedOrder, expandedAttempt, expandAttempt } = this.props;

    return (
      <div>
        { expandedOrder &&
          <div className={expandedAttempt ? styles.panelDetailsShiftLeft : styles.panelDetails}>
            <div className={styles.closeButton} onClick={this.props.hideOrder}>
              &times;
            </div>
            <div onClick={expandAttempt} className={styles.orderDueTime}>
            </div>
            <div className={styles.orderDetails}>
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

function AttemptDetails({hideAttempt}) {
  return(
      <div className={styles.attemptPanel}>
        <div className={styles.orderDueTime} onClick={hideAttempt}>

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
