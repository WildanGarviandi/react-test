import React from 'react';
import {connect} from 'react-redux';
import Accordion from '../base/filterAccordion';
import * as OrdersPickup from '../../modules/pickupOrders';

function mapDispatchToPickupOrders(dispatch) {
  return {
    filterAction: (ids) => {
      dispatch(OrdersPickup.AddFilters({
        userOrderNumbers: JSON.stringify(ids),
      }));
    }
  }
}

export default connect(undefined, mapDispatchToPickupOrders)(Accordion);
