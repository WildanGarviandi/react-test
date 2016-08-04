import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {columns} from './pickupOrdersColumns';
import PickupOrdersBody from './pickupOrdersBody';
import PickupOrdersFilters from './pickupOrdersFilters';
import PickupOrdersHeaders from './pickupOrdersHeaders';
import styles from './table.css';
import OrdersPickup from '../../modules/orders/actions/pickup';
import OrdersSelector from '../../modules/orders/selector';

const Table = React.createClass({
  componentDidMount() {
    this.props.GetOrders();
  },
  render() {
    return (
      <table className={styles.table}>
        <PickupOrdersHeaders />
        <PickupOrdersFilters /> 
        <PickupOrdersBody items={this.props.orders} />
      </table>
    );
  }
});

function mapStateToPickupOrders(state) {
  const orders = OrdersSelector.GetOrders(state);
  return {
    orders,
  }
}

function mapDispatchToPickupOrders(dispatch) {
  return {
    GetOrders: () => {
      dispatch(OrdersPickup.Fetch());
    }
  }
}

export default connect(mapStateToPickupOrders, mapDispatchToPickupOrders)(Table);
