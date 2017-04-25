import React from 'react';
import {connect} from 'react-redux';
import styles from './styles.css';
import {ButtonWithLoading, Input, Page} from '../views/base';
import OrderTable, {Filter} from './orderTable';

const OrderMonitoringPage = React.createClass({
  getInitialState() {
    return ({
      showDelivery: true,
      showSucceed: false,
      showPending: false,
      showFailed: false
    });
  },
  activateDelivery() {
    this.setState({
      showDelivery: true,
      showSucceed: false,
      showPending: false,
      showFailed: false
    });
  },
  activateSucceed() {
    this.setState({
      showDelivery: false,
      showSucceed: true,
      showPending: false,
      showFailed: false
    });
  },
  activatePending() {
    this.setState({
      showDelivery: false,
      showSucceed: false,
      showPending: true,
      showFailed: false
    });
  },
  activateFailed() {
    this.setState({
      showDelivery: false,
      showSucceed: false,
      showPending: false,
      showFailed: true
    });
  },
  componentWillMount() {
    // this.props.ResetFilter();
    // this.props.ResetFilterReady();
    // this.props.GetList();
    // this.props.GetListReady();
    if (!this.props.userLogged.hubID) {
      window.location.href = config.defaultMainPageTMS;
    }
  },
  render() {
    return (
      <Page title="Order Monitoring">
        <PanelDetails expandedOrder={false} />
        <div className={styles.widgetOuterContainer}>
          <div onClick={this.activateDelivery} className={`${styles.widgetContainer} ${this.state.showDelivery ? styles.toggleWidgetActive : styles.toggleWidget}`}>
            <span className={styles.widgetTitle}>Total Delivery</span>
            <span className={styles.total}>1234</span>
          </div>
          <span className={styles.arbitTogglePickup}> | </span>
          <div onClick={this.activateSucceed} className={`${styles.widgetContainer} ${this.state.showSucceed ? styles.toggleWidgetActive : styles.toggleWidget}`}>
            <span className={styles.widgetTitle}>Total Succeed Delivery</span>
            <span className={styles.total}>650</span>
          </div>
          <span className={styles.arbitTogglePickup}> | </span>
          <div onClick={this.activatePending} className={`${styles.widgetContainer} ${this.state.showPending ? styles.toggleWidgetActive : styles.toggleWidget}`}>
            <span className={styles.widgetTitle}>Total Pending Delivery</span>
            <span className={styles.total}>450</span>
          </div>
          <span className={styles.arbitTogglePickup}> | </span>
          <div onClick={this.activateFailed} className={`${styles.widgetContainer} ${this.state.showFailed ? styles.toggleWidgetActive : styles.toggleWidget}`}>
            <span className={styles.widgetTitle}>Total Failed Delivery</span>
            <span className={styles.total}>134</span>
          </div>
        </div>

        <div className={styles.contentOuterContainer}>
          <div className={styles.contentContainer}>
            <div className={styles.mainTable}>
              <Filter />
              {/*{ this.state.showDelivery &&
                <Filter />
              }
              {
                this.state.showSucceed &&
                <div>Show Succeed</div>
              }
              {
                this.state.showPending &&
                <div>Show Pending</div>
              }
              {
                this.state.showFailed &&
                <div>Show Failed</div>
              }*/}
            </div>
            { this.state.showDelivery &&
              <div>
                Total
                <OrderTable />
              </div>
            }
            {
              this.state.showSucceed &&
              <div>
                Succeed
                <OrderTable />
              </div>
            }
            {
              this.state.showPending &&
              <div>
                Pending
                <OrderTable />
              </div>
            }
            {
              this.state.showFailed &&
              <div>
                Failed
                <OrderTable />
              </div>
            }
          </div>
        </div>
      </Page>
    );
  }
});

function mapState(state) {
  const userLogged = state.app.userLogged;

  return {
    userLogged
  }
}

export default connect(mapState)(OrderMonitoringPage)

const PanelDetails = React.createClass({
  render() {
    const { expandedOrder, shrinkOrder, isExpandDriver } = this.props;
    return (
      <div>
        { expandedOrder &&
          <div className={expandedOrder ? styles.panelDetails : styles.panelDetailsHidden}>
            <div className={styles.closeButton}>
              &times;
            </div>
            <div className={styles.orderDueTime}>
              14 Jam
            </div>
            <div className={styles.orderDetails}>
              <div className={styles.orderDetailsLabel}>
                Order ID
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
        }
      </div>
    );
  }
});
