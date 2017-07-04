import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import Table from './ordersTable';
import InboundOrdersBody from './inboundOrdersBody';
import InboundOrdersHeaders from './inboundOrdersHeaders';
import * as InboundOrders from '../../modules/inboundOrders';
import OrdersSelector from '../../modules/orders/selector';
import {modalAction} from './modals/constants';

function mapStateToInboundOrders(state, ownProps) {
  const {inboundOrders} = state.app;
  const {currentPage, isFetching, limit, orders, selected, total} = inboundOrders;

  return {
    Headers: InboundOrdersHeaders,
    Body: InboundOrdersBody,
    isFetching: isFetching,
    items: orders,
    pagination: {
      currentPage, limit, total,
    },
    isInbound: true,
    isFill: false,
  }
}

function mapDispatchToInboundOrders(dispatch, ownProps) {
  return {
    GetList: () => {
      if(ownProps.isFill) {
        dispatch(InboundOrders.FetchNotAssignedList());
      } else {
        dispatch(InboundOrders.FetchList());
      }
    },
    PaginationActions: {
      setCurrentPage: (currentPage) => {
        dispatch(InboundOrders.SetCurrentPage(currentPage));
      },
      setLimit: (limit) => {
        dispatch(InboundOrders.SetLimit(limit));
      },
    }
  }
}

export default connect(mapStateToInboundOrders, mapDispatchToInboundOrders)(Table);
