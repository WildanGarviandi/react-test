import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import Table from './ordersTable';
import ReceivedOrdersFilters from './receivedOrdersFilters';
import ReceivedOrdersBody from './receivedOrdersBody';
import ReceivedOrdersHeaders from './receivedOrdersHeaders';
import OrdersSelector from '../../modules/orders/selector';
import * as ReceivedOrders from '../../modules/receivedOrders';

function mapStateToPickupOrders(state) {
  const {receivedOrders} = state.app;
  const {currentPage, isFetching, limit, orders, selected, total} = receivedOrders;

  return {
    Headers: ReceivedOrdersHeaders,
    Filters: ReceivedOrdersFilters,
    Body: ReceivedOrdersBody,
    isFetching: isFetching,
    items: orders,
    pagination: {
      currentPage, limit, total,
    }
  }
}

function mapDispatchToPickupOrders(dispatch) {
  return {
    GetList: () => {
      dispatch(ReceivedOrders.FetchList());
    },
    PaginationActions: {
      setCurrentPage: (currentPage) => {
        dispatch(ReceivedOrders.SetCurrentPage(currentPage));
      },
      setLimit: (limit) => {
        dispatch(ReceivedOrders.SetLimit(limit));
      },
    }
  }
}

export default connect(mapStateToPickupOrders, mapDispatchToPickupOrders)(Table);
