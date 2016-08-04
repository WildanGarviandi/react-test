import React from 'react';
import {connect} from 'react-redux';
import {filters} from './pickupOrdersColumns';
import Filters, {StatusFilter, TextFilter} from '../base/filters';
import OrdersPickupActions from '../../modules/orders/actions/pickup';

function mapDispatchToPickupOrders(dispatch) {
  return {
    filterFunc: function(filter) {
      OrdersPickupActions.updateFilter(filter);
    }
  }
}

const PickupOrdersStatusFilter = connect(undefined, mapDispatchToPickupOrders)(StatusFilter);
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
  return <Filters items={filters} components={FiltersComponents} />
}

export default PickupOrdersFilter;
