import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import Table from '../views/order/ordersTable';
import UpdateOrdersBody from './updateOrdersBody';
import UpdateOrdersHeaders from './updateOrdersHeaders';
import * as UpdateOrders from './updateOrdersService';
import OrdersSelector from '../modules/orders/selector';

function mapStateToUpdateOrders(state, ownProps) {
  const {updateOrders} = state.app;
  const {currentPage, isFetching, limit, orders, selected, total} = updateOrders;

  return {
    Headers: UpdateOrdersHeaders,
    Body: UpdateOrdersBody,
    isFetching: isFetching,
    items: orders,
    pagination: {
      currentPage, limit, total,
    },
    isUpdate: true,
    isFill: false,
  }
}

function mapDispatchToUpdateOrders(dispatch, ownProps) {
  return {
    GetList: () => {
      if(ownProps.isFill) {
        dispatch(UpdateOrders.FetchNotAssignedList());
      } else {
        dispatch(UpdateOrders.FetchList());
      }
    },
    PaginationActions: {
      setCurrentPage: (currentPage) => {
        dispatch(UpdateOrders.SetCurrentPage(currentPage));
      },
      setLimit: (limit) => {
        dispatch(UpdateOrders.SetLimit(limit));
      },
    }
  }
}

export default connect(mapStateToUpdateOrders, mapDispatchToUpdateOrders)(Table);
