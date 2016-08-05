import lodash from 'lodash';
import React from 'react';
import ReceivedOrdersTable from './receivedOrdersTable';
import styles from './styles.css';
import {ButtonWithLoading, Page} from '../base';
import Filter from '../container/accordion';

const OrderFinder = React.createClass({
  render() {
    return (
      <div className={styles.finderWrapper}>
        <span className={styles.finderLabel}>Jump to Order :</span>
        <input />
      </div>
    );
  }
});

const PickupOrders = React.createClass({
  render() {
    const {orders} = this.props;
    const groupingOrdersBtnProps = {
      textBase: "Consolidate Orders",
      textLoading: "Consolidating Orders",
      isLoading: false,
      onClick: () => null,
    }

    return (
      <Page title="Received Orders">
        <ButtonWithLoading {...groupingOrdersBtnProps} />
        <OrderFinder />
        <Filter />
        <ReceivedOrdersTable orders={orders} />
      </Page>
    );
  }
});

export default PickupOrders;
