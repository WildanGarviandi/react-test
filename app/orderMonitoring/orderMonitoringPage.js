import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import styles from './styles.css';
import { ButtonWithLoading, Input, Page } from '../views/base';
import OrderTable, { Filter } from './orderTable';
import * as orderService from './orderMonitoringService';

const pagePropTypes = {
  count: PropTypes.any,
  expandedOrder: PropTypes.bool,
};

const pageDefaultProps = {
  count: null,
  expandedOrder: false,
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

  render() {
    const { succeedDelivery, pendingDelivery, failedDelivery } = this.props.count;

    return (
      <Page title="Order Monitoring">
        <PanelDetails expandedOrder={this.props.expandedOrder} />
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
              {
                this.state.showSucceed &&
                <Filter />
              }
              {
                this.state.showPending &&
                <Filter />
              }
              {
                this.state.showFailed &&
                <Filter />
              }
            </div>
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
  const { currentPage, limit, total, expandedOrder, count } = store.app.orderMonitoring;

  return {
    userLogged,
    paginationState: {
        currentPage, limit, total,
    },
    expandedOrder,
    count,
  };
}

function mapDispatch(dispatch) {
  return {
    FetchCount: () => {
      dispatch(orderService.FetchCount());
    },
    ExpandOrder: () => {
      dispatch(orderService.ExpandOrder());
    },
    HideOrder: () => {
      dispatch(orderService.HideOrder());
    }
  };
}

OrderMonitoringPage.propTypes = pagePropTypes;
OrderMonitoringPage.defaultProps = pageDefaultProps;

export default connect(mapState, mapDispatch)(OrderMonitoringPage);

const panelPropTypes = {
  expandedOrder: PropTypes.bool.isRequired,
};

const panelDefaultProps = {
  expandedOrder: false,
};

class PanelDetails extends Component {
  render() {
    const { expandedOrder } = this.props;
    return (
      <div>
        { expandedOrder &&
          <div className={expandedOrder ? styles.panelDetails : styles.panelDetailsHidden}>
            <div className={styles.closeButton}>
              &times;
            </div>
            <div className={styles.orderDueTime}>
              &nbsp;
            </div>
            <div className={styles.orderDetails}>
              <div className={styles.orderDetailsLabel}>
                Order ID
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

PanelDetails.PropTypes = panelPropTypes;
PanelDetails.DefaultProps = panelDefaultProps;
