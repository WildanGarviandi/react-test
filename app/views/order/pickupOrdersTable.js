import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import Table from './ordersTable';
import PickupOrdersBody from './pickupOrdersBody';
import PickupOrdersFilters from './pickupOrdersFilters';
import PickupOrdersHeaders from './pickupOrdersHeaders';
import * as OrdersPickup from '../../modules/orders/actions/pickup';
import OrdersSelector from '../../modules/orders/selector';

function mapStateToPickupOrders(state) {
  const {pickupOrders} = state.app;
  const {currentPage, isFetching, limit, list, selected, total} = pickupOrders;
  const orders = lodash.map(list, (order, index) => {
    return lodash.assign(order, {IsChecked: selected[index]});
  });

  return {
    Headers: PickupOrdersHeaders,
    Filters: PickupOrdersFilters,
    Body: PickupOrdersBody,
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
