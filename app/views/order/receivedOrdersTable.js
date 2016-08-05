import React from 'react';
import {connect} from 'react-redux';
import Table from './ordersTable';
import ReceivedOrdersFilters from './receivedOrdersFilters';
import ReceivedOrdersBody from './receivedOrdersBody';
import ReceivedOrdersHeaders from './receivedOrdersHeaders';
import OrdersPickup from '../../modules/orders/actions/pickup';
import OrdersSelector from '../../modules/orders/selector';

function mapStateToPickupOrders(state) {
  const items = OrdersSelector.GetOrders(state);
  return {
    Headers: ReceivedOrdersHeaders,
    Filters: ReceivedOrdersFilters,
    Body: ReceivedOrdersBody,
    items,
  }
}

function mapDispatchToPickupOrders(dispatch) {
  return {
    GetList: () => {
      dispatch(OrdersPickup.Fetch());
    }
  }
}

export default connect(mapStateToPickupOrders, mapDispatchToPickupOrders)(Table);
