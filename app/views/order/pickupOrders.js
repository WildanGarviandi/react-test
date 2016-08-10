import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import PickupOrdersTable from './pickupOrdersTable';
import styles from './styles.css';
import {ButtonWithLoading, Page} from '../base';
import Accordion from './pickupOrdersAccordion';
import * as OrdersPickup from '../../modules/orders/actions/pickup';

const PickupOrders = React.createClass({
  render() {
    const groupingOrdersBtnProps = {
      textBase: "Group Orders",
      textLoading: "Grouping Orders",
      isLoading: this.props.isGrouping,
      onClick: this.props.GroupOrders,
      styles: {
        base: this.props.isGrouping ? styles.greenBtnLoading : styles.greenBtn,
      }
    }

    return (
      <Page title="Pickup Orders" additional="Get this order from merchant">
        <ButtonWithLoading {...groupingOrdersBtnProps} />
        <Accordion />
        <PickupOrdersTable />
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
      dispatch(OrdersPickup.groupOrders());
    }
  }
}

export default connect(mapState, mapDispatch)(PickupOrders);
