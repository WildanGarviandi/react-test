import React from 'react';
import {connect} from 'react-redux';
import {conf, pickupOrdersColumns} from './ordersColumns';
import {Filters} from '../base/table';
import FiltersRow, {StatusFilter, TextFilter} from '../base/filters';
import * as OrdersPickup from '../../modules/orders/actions/pickup';

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

function statusDispatch(dispatch) {
  return {
    filterFunc: function(filter) {
      dispatch(OrdersPickup.setFilter({status: filter.val.key}));
    }
  }
}

const PickupOrdersStatusFilter = connect(undefined, statusDispatch)(StatusFilter);
const PickupOrdersTextFilter = connect(undefined, mapDispatchToPickupOrders)(TextFilter);

function FiltersComponents(type, item) {
  switch(type) {
    case "StatusDropdown": {
      return <PickupOrdersStatusFilter {...item} />
    }

    case "String": {
      return <PickupOrdersTextFilter {...item} />
    }

    default: {
      return null;
    }
  }
}

function PickupOrdersFilter() {
  const filters = Filters(conf, pickupOrdersColumns);
  return <FiltersRow items={filters} components={FiltersComponents} />
}

export default PickupOrdersFilter;
