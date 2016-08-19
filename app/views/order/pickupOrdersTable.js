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
  const {currentPage, isFetching, limit, orders, selected, total} = pickupOrders;
  // const orders = lodash.map(list, (order, index) => {
  //   return lodash.assign(order, {IsChecked: selected[index]});
  // });

  return {
    Headers: PickupOrdersHeaders,
    Filters: PickupOrdersFilters,
    Body: PickupOrdersBody,
    isFetching: isFetching,
    items: orders,
    pagination: {
      currentPage, limit, total,
    }
  }
}

function mapDispatchToPickupOrders(dispatch, ownProps) {
  return {
    GetList: () => {
      console.log('please', ownProps.isFill, ownProps);
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
    }
  }
}

export default connect(mapStateToPickupOrders, mapDispatchToPickupOrders)(Table);
