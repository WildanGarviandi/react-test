import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import Table from '../views/order/ordersTable';
import groupingBody from './groupingBody';
import groupingHeaders from './groupingHeaders';
import * as Grouping from './groupingService';
import OrdersSelector from '../modules/orders/selector';

function mapStateToGrouping(state, ownProps) {
  const {grouping} = state.app;
  const {currentPage, isFetching, limit, orders, selected, total, isGrouping} = grouping;

  return {
    Headers: groupingHeaders,
    Body: groupingBody,
    isFetching,
    isGrouping,
    items: orders,
    pagination: {
      currentPage, limit, total,
    },
    isGroupingPage: true,
    isFill: false,
  }
}

function mapDispatchToGrouping(dispatch, ownProps) {
  return {
    GetList: () => {
      dispatch(Grouping.FetchList());
    },
    PaginationActions: {
      setCurrentPage: (currentPage) => {
        dispatch(Grouping.SetCurrentPage(currentPage));
      },
      setLimit: (limit) => {
        dispatch(Grouping.SetLimit(limit));
      },
    }
  }
}

export default connect(mapStateToGrouping, mapDispatchToGrouping)(Table);
