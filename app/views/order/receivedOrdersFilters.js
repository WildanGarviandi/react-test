import React from 'react';
import {connect} from 'react-redux';
import {conf, receivedOrdersColumns} from './ordersColumns';
import {Filters} from '../base/table';
import FiltersRow, {StatusFilter, TextFilter} from '../base/filters';
import * as OrdersReceived from '../../modules/orders/actions/received';
import * as ReceivedOrders from '../../modules/receivedOrders';

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

        case "DropoffAddress": {
          newFilter = {dropoff: filter.val};
          break;
        }

        case "DropoffCity": {
          newFilter = {dropoffCity: filter.val};
          break;
        }

        case "DropoffState": {
          newFilter = {dropoffState: filter.val};
          break;
        }

        case "ZipCode": {
          newFilter = {dropoffZip: filter.val};
          break;
        }

        case "ID": {
          newFilter = {userOrderNumber: filter.val};
          break;
        }

        case "NextDestination": {
          newFilter = {nextDestination: filter.val};
          break;
        }

        case "SuggestedVendors": {
          newFilter = {suggestedVendor: filter.val};
          break;
        }
      }

      dispatch(ReceivedOrders.AddFilters(newFilter));
    }
  }
}

function statusDispatch(dispatch) {
  return {
    filterFunc: function(filter) {
      dispatch(ReceivedOrders.SetStatus(filter.val.value));
    }
  }
}

function stateToStatus(state) {
  return {
    val: state.app.receivedOrders.filterStatus,
  }
}

const ReceivedOrdersStatusFilter = connect(stateToStatus, statusDispatch)(StatusFilter);
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
