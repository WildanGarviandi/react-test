import lodash from 'lodash';
import React from 'react';
import PickupOrdersTable from './pickupOrdersTable';
import styles from './table.css';
import {ButtonWithLoading, Page} from '../base';
import Filter from '../container/accordion';

const PickupOrders = React.createClass({
  render() {
    const {orders} = this.props;
    const groupingOrdersBtnProps = {
      textBase: "Group Orders",
      textLoading: "Grouping Orders",
      isLoading: false,
      onClick: () => null,
    }

    return (
      <Page title="Pickup Orders">
        <ButtonWithLoading {...groupingOrdersBtnProps} />
        <Filter />
        <PickupOrdersTable orders={orders} />
      </Page>
    );
  }
});

export default PickupOrders;
