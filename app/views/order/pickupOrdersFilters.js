import React from 'react';
import {connect} from 'react-redux';
import {conf, pickupOrdersColumns} from './ordersColumns';
import {Filters} from '../base/table';
import FiltersRow, {StatusFilter, TextFilter} from '../base/filters';
import * as OrdersPickup from '../../modules/orders/actions/pickup';
import * as PickupOrders from '../../modules/pickupOrders';
import * as Table from '../../components/table';

function mapDispatchToPickupOrders(dispatch) {
  return {
    filterFunc: function(filter) {
      let newFilter = {};

      switch(filter.key) {
        case "UserOrderNumber": {
          newFilter = {userOrderNumber: filter.val};
          break;
        }

        case "WebstoreName": {
          newFilter = {merchant: filter.val};
          break;
        }

        case "PickupAddress": {
          newFilter = {pickup: filter.val};
          break;
        }

        case "PickupCity": {
          newFilter = {pickupCity: filter.val};
          break;
        }

        case "PickupState": {
          newFilter = {pickupState: filter.val};
          break;
        }

        case "ID": {
          newFilter = {userOrderNumber: filter.val};
          break;
        }
      }

      dispatch(PickupOrders.AddFilters(newFilter));
    }
  }
}

function statusDispatch(dispatch) {
  return {
    filterFunc: function(filter) {
      dispatch(PickupOrders.SetStatus(filter.val.value));
    }
  }
}

function stateToStatus(state) {
  return {
    val: state.app.pickupOrders.filterStatus,
  }
}

function DateRangeBuilder(keyword) {
    return (store) => {
        const {filters} = store.app.pickupOrders;
        return {
            startDate: filters['start' + keyword],
            endDate: filters['end' + keyword],
        }
    }
}

function DateRangeDispatch(keyword) {
    return (dispatch) => {
        return {
            onChange: (event, picker) => {
                const newFilters = {
                    ['start' + keyword]: picker.startDate.toISOString(),
                    ['end' + keyword]: picker.endDate.toISOString()
                }
                dispatch(PickupOrders.AddFilters(newFilters));
            }
        }
    }
}

const PickupOrdersStatusFilter = connect(stateToStatus, statusDispatch)(StatusFilter);
const PickupOrdersTextFilter = connect(undefined, mapDispatchToPickupOrders)(TextFilter);
const PickupTimeFilter = connect(DateRangeBuilder('Pickup'), DateRangeDispatch('Pickup'))(Table.FilterDateTimeRangeCell);

function FiltersComponents(type, item) {
  switch(type) {
    case "StatusDropdown": {
      return <PickupOrdersStatusFilter {...item} />
    }

    case "String": {
      return <PickupOrdersTextFilter {...item} />
    }

    case "DateTime": {
      return <PickupTimeFilter {...item} />
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
