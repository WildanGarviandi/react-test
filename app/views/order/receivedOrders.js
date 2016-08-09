import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import ReceivedOrdersTable from './receivedOrdersTable';
import styles from './table.css';
import {ButtonWithLoading, Page} from '../base';
import Accordion from './receivedOrdersAccordion';
import * as OrdersReceived from '../../modules/orders/actions/received';

const PickupOrders = React.createClass({
  render() {
    const groupingOrdersBtnProps = {
      textBase: "Consolidate Orders",
      textLoading: "Consolidate Orders",
      isLoading: this.props.isGrouping,
      onClick: this.props.GroupOrders,
    }

    return (
      <Page title="Received Orders">
        <ButtonWithLoading {...groupingOrdersBtnProps} />
        <Accordion />
        <ReceivedOrdersTable />
      </Page>
    );
  }
});

function mapState(state) {
  const {pickupOrders} = state.app;
  const {isGrouping} = pickupOrders;

  return {
    isGrouping,
  }
}

function mapDispatch(dispatch) {
  return {
    GroupOrders: () => {
      dispatch(OrdersReceived.groupOrders());
    }
  }
}

export default connect(mapState, mapDispatch)(PickupOrders);
