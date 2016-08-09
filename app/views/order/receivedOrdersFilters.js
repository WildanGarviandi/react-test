import React from 'react';
import {connect} from 'react-redux';
import {conf, receivedOrdersColumns} from './ordersColumns';
import {Filters} from '../base/table';
import FiltersRow, {StatusFilter, TextFilter} from '../base/filters';
import * as OrdersReceived from '../../modules/orders/actions/received';

function mapDispatchToPickupOrders(dispatch) {
  return {
    filterFunc: function(filter) {
      let newFilter = {};

      switch(filter.key) {
        case "UserOrderNumber": {
          newFilter = {userOrderNumber: filter.val};
          break;
        }

        case "PickupAddress": {
          newFilter = {pickup: filter.val};
          break;
        }

        case "ID": {
          newFilter = {userOrderNumber: filter.val};
          break;
        }
      }

      dispatch(OrdersPickup.setFilter(newFilter));
    }
  }
}

const ReceivedOrdersStatusFilter = connect(undefined, mapDispatchToPickupOrders)(StatusFilter);
const ReceivedOrdersTextFilter = connect(undefined, mapDispatchToPickupOrders)(TextFilter);

function FiltersComponents(type, item) {
  switch(type) {
    case "StatusDropdown": {
      return <ReceivedOrdersStatusFilter {...item} />
    }

    case "String": {
      return <ReceivedOrdersTextFilter {...item} />
    }

    default: {
      return null;
    }
  }
}

function PickupOrdersFilter() {
  const filters = Filters(conf, receivedOrdersColumns);
  return <FiltersRow items={filters} components={FiltersComponents} />
}

export default PickupOrdersFilter;
