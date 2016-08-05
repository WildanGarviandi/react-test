import React from 'react';
import {connect} from 'react-redux';
import {conf, receivedOrdersColumns} from './ordersColumns';
import {Filters} from '../base/table';
import FiltersRow, {StatusFilter, TextFilter} from '../base/filters';
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
  const filters = Filters(conf, receivedOrdersColumns);
  return <FiltersRow items={filters} components={FiltersComponents} />
}

export default PickupOrdersFilter;
