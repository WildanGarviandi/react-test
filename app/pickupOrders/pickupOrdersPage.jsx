import lodash from 'lodash'; // eslint-disable-line
import React from 'react';
import { connect } from 'react-redux';
import PickupOrdersTable, { Filter } from './pickupOrdersTable';
import PickupOrdersReadyTable, { FilterReady } from './pickupOrdersReadyTable';
import styles from './styles.scss';
import { Page } from '../views/base';
import * as PickupOrders from './pickupOrdersService';
import * as PickupOrdersReady from './pickupOrdersReadyService';
import config from '../config/configValues.json';

const PickupOrdersPage = React.createClass({
  getInitialState() {
    return ({
      showReady: true,
      showNotReady: false,
    });
  },
  activateReady() {
    this.setState({ showReady: true });
    this.setState({ showNotReady: false });
  },
  activateNotReady() {
    this.setState({ showReady: false });
    this.setState({ showNotReady: true });
  },
  componentWillMount() {
    this.props.ResetFilter();
    this.props.ResetFilterReady();
    this.props.GetList();
    this.props.GetListReady();
    if (!this.props.userLogged.hubID) {
      window.location.href = config.defaultMainPageTMS;
    }
  },
  checkAutoGroup() {
    setInterval(() => {
      this.props.CheckAutoGroup();
    }, config.autoGroupInterval);
  },
  render() {
    return (
      <Page title="Pickup Orders">
        <div className={styles.toggleReady}>
          <span
            role="button"
            onClick={this.activateReady}
            className={this.state.showReady ? styles.togglePickupActive : styles.togglePickup}
          >
            Ready to be picked
            <span className={styles.blueSpan}> ({this.props.totalReady}) </span>
          </span>
          <span className={styles.arbitTogglePickup}> | </span>
          <span
            role="button"
            onClick={this.activateNotReady}
            className={this.state.showNotReady ? styles.togglePickupActive : styles.togglePickup}
          >
            Not ready to be picked
            <span className={styles.blueSpan}> ({this.props.totalNotReady}) </span>
          </span>
        </div>
        <div className={styles.mainTable}>
          {this.state.showReady &&
            <FilterReady
              isFetchingReady={this.props.isFetchingReady}
              isAutoGroupActive={this.props.isAutoGroupActive}
              isGroupActive={this.props.isGroupActive}
              userLogged={this.props.userLogged}
            />
          }
          {
            this.state.showNotReady &&
            <Filter
              isSetPickupActive={this.props.isSetPickupActive}
              isFetching={this.props.isFetching}
              userLogged={this.props.userLogged}
            />
          }
        </div>
        {this.state.showReady &&
          <PickupOrdersReadyTable />
        }
        {
          this.state.showNotReady &&
          <PickupOrdersTable />
        }
      </Page>
    );
  },
});

function mapState(state) {
  const { pickupOrders, pickupOrdersReady } = state.app;
  const userLogged = state.app.userLogged;
  const totalNotReady = pickupOrders.fixTotal;
  const isFetchingNotReady = pickupOrders.isFetching;
  const totalReady = pickupOrdersReady.fixTotal;
  const isFetchingReady = pickupOrdersReady.isFetching;
  const isAutoGroupActive = pickupOrdersReady.isAutoGroupActive;
  const trips = pickupOrdersReady.trips;
  const notReady = pickupOrders.orders;
  let isGroupActive = true;
  let isSetPickupActive = true;

  const checkedOrdersIDs = lodash.chain(trips)
    .filter((order) => {
      return order.IsChecked;
    })
    .map(order => (order.UserOrderID))
    .value();

  if (checkedOrdersIDs.length === 0) {
    isGroupActive = false;
  }

  const checkedOrdersIDsNotReady = lodash.chain(notReady)
    .filter((order) => {
      return order.IsChecked;
    })
    .map(order => (order.UserOrderID))
    .value();

  if (checkedOrdersIDsNotReady.length === 0) {
    isSetPickupActive = false;
  }

  return {
    totalReady,
    totalNotReady,
    isFetchingReady,
    isFetchingNotReady,
    userLogged,
    isAutoGroupActive,
    isGroupActive,
    isSetPickupActive,
  };
}

function mapDispatch(dispatch) {
  return {
    GroupOrders: () => {
      dispatch(PickupOrders.GroupOrders());
    },
    MarkPickup: () => {
      dispatch(PickupOrders.MarkPickup());
    },
    ResetFilter: () => {
      dispatch(PickupOrders.ResetFilter());
    },
    ResetFilterReady: () => {
      dispatch(PickupOrdersReady.ResetFilter());
    },
    GetList: () => {
      dispatch(PickupOrders.FetchList());
    },
    GetListReady: () => {
      dispatch(PickupOrdersReady.FetchList());
    },
    CheckAutoGroup: () => {
      dispatch(PickupOrdersReady.CheckAutoGroup());
    },
  };
}

export default connect(mapState, mapDispatch)(PickupOrdersPage);
