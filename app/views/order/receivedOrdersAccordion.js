import React from 'react';
import {connect} from 'react-redux';
import Accordion from '../base/filterAccordion';
import * as OrdersReceived from '../../modules/receivedOrders';

function mapDispatchToPickupOrders(dispatch) {
  return {
    filterAction: (ids) => {
      dispatch(OrdersReceived.AddFilters({
        userOrderNumbers: JSON.stringify(ids),
      }));
    }
  }
}

export default connect(undefined, mapDispatchToPickupOrders)(Accordion);
