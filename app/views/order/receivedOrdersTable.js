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
  const {currentPage, isFetching, isConsolidating, limit, orders, selected, total} = receivedOrders;

  return {
    Headers: ReceivedOrdersHeaders,
    Filters: ReceivedOrdersFilters,
    Body: ReceivedOrdersBody,
    isFetching: isFetching,
    isGrouping: isConsolidating,
    items: orders,
    pagination: {
      currentPage, limit, total,
    },
    isPickup: false,
  }
}

function mapDispatchToPickupOrders(dispatch, ownProps) {
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
    },
    GroupOrders: () => {
      dispatch(ReceivedOrders.ConsolidateOrders());
    },
    FindID: (id) => {
      dispatch(ReceivedOrders.GoToDetails(id));
    },
  }
}

export default connect(mapStateToPickupOrders, mapDispatchToPickupOrders)(Table);
