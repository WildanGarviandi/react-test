import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import Table from './ordersTable';
import PickupOrdersBody from './pickupOrdersBody';
import PickupOrdersFilters from './pickupOrdersFilters';
import PickupOrdersHeaders from './pickupOrdersHeaders';
import * as OrdersPickup from '../../modules/orders/actions/pickup';
import * as PickupOrders from '../../modules/pickupOrders';
import OrdersSelector from '../../modules/orders/selector';

function mapStateToPickupOrders(state) {
  const {pickupOrders} = state.app;
  const {currentPage, isFetching, isGrouping, limit, orders, selected, total} = pickupOrders;

  return {
    Headers: PickupOrdersHeaders,
    Filters: PickupOrdersFilters,
    Body: PickupOrdersBody,
    isFetching: isFetching,
    isGrouping: isGrouping,
    items: orders,
    pagination: {
      currentPage, limit, total,
    },
    isPickup: true,
  }
}

function mapDispatchToPickupOrders(dispatch, ownProps) {
  return {
    GetList: () => {
      if(ownProps.isFill) {
        dispatch(PickupOrders.FetchNotAssignedList());
      } else {
        dispatch(PickupOrders.FetchList());
      }
    },
    PaginationActions: {
      setCurrentPage: (currentPage) => {
        dispatch(PickupOrders.SetCurrentPage(currentPage));
      },
      setLimit: (limit) => {
        dispatch(PickupOrders.SetLimit(limit));
      },
    },
    GroupOrders: () => {
      dispatch(PickupOrders.GroupOrders());
    }
  }
}

export default connect(mapStateToPickupOrders, mapDispatchToPickupOrders)(Table);
