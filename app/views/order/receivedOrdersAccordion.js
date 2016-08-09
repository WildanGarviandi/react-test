import React from 'react';
import {connect} from 'react-redux';
import Accordion from '../base/filterAccordion';
import * as OrdersReceived from '../../modules/orders/actions/received';

function mapDispatchToPickupOrders(dispatch) {
  return {
    filterAction: (ids) => {
      dispatch(OrdersReceived.setFilter({
        userOrderNumbers: JSON.stringify(ids),
      }));
    }
  }
}

export default connect(undefined, mapDispatchToPickupOrders)(Accordion);
