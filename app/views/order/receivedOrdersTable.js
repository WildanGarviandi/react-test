import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import Table from './ordersTable';
import ReceivedOrdersFilters from './receivedOrdersFilters';
import ReceivedOrdersBody from './receivedOrdersBody';
import ReceivedOrdersHeaders from './receivedOrdersHeaders';
import OrdersSelector from '../../modules/orders/selector';
import * as OrdersPickup from '../../modules/orders/actions/received';

function mapStateToPickupOrders(state) {
  const {receivedOrders} = state.app;
  const {currentPage, isFetching, limit, list, selected, total} = receivedOrders;
  const orders = lodash.map(list, (order, index) => {
    return lodash.assign(order, {IsChecked: selected[index]});
  });

  return {
    Headers: ReceivedOrdersHeaders,
    Filters: ReceivedOrdersFilters,
    Body: ReceivedOrdersBody,
    isFetching: isFetching,
    items: list,
    pagination: {
      currentPage, limit, total,
    }
  }
}

function mapDispatchToPickupOrders(dispatch) {
  return {
    GetList: () => {
      dispatch(OrdersPickup.fetchList());
    },
    PaginationActions: {
      setCurrentPage: (currentPage) => {
        dispatch(OrdersPickup.setCurrentPage(currentPage));
      },
      setLimit: (limit) => {
        dispatch(OrdersPickup.setLimit(limit));
      },
    }
  }
}

export default connect(mapStateToPickupOrders, mapDispatchToPickupOrders)(Table);
