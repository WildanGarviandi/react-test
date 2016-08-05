import React from 'react';
import {connect} from 'react-redux';
import Table from './ordersTable';
import PickupOrdersBody from './pickupOrdersBody';
import PickupOrdersFilters from './pickupOrdersFilters';
import PickupOrdersHeaders from './pickupOrdersHeaders';
import OrdersPickup from '../../modules/orders/actions/pickup';
import OrdersSelector from '../../modules/orders/selector';

function mapStateToPickupOrders(state) {
  const items = OrdersSelector.GetOrders(state);
  return {
    Headers: PickupOrdersHeaders,
    Filters: PickupOrdersFilters,
    Body: PickupOrdersBody,
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
