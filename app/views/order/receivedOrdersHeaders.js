import React from 'react';
import {connect} from 'react-redux';
import {conf, receivedOrdersColumns} from './ordersColumns';
import {Headers} from '../base/table';
import HeadersRow from '../base/headers';
import {CheckBox} from '../base/input';
import * as OrdersPickup from '../../modules/orders/actions/received';
import * as ReceivedOrders from '../../modules/receivedOrders';
import {CheckboxHeader} from '../base/tableCell';

function stateToCheckbox(state) {
  const checkedAll = state.app.receivedOrders.checkedAll;
  return {
    isChecked: checkedAll,
  }
}

function mapDispatchToCheckBox(dispatch) {
  return {
    onToggle: function() {
      dispatch(ReceivedOrders.ToggleSelectAll());
    }
  }
}

const PickupOrdersCheckBox = connect(stateToCheckbox, mapDispatchToCheckBox)(CheckboxHeader);

function HeaderComponent(type, item) {
  switch(type) {
    case "Checkbox": {
      return <PickupOrdersCheckBox />;
    }

    default: {
      return <span>{item.header.title}</span>;
    }
  }
}

function PickupOrdersHeaders() {
  const headers = Headers(conf, receivedOrdersColumns);
  return (
    <thead>
      <tr>
        <PickupOrdersCheckBox />
        <th>{'AWB'}<br/>{'(Web Order ID)'}</th>
        <th>{'Merchant'}</th>
        <th>{'Dropoff Address'}</th>
        <th>{'City'}</th>
        <th>{'State'}</th>
        <th>{'ZIP Code'}</th>
        <th>{'Deadline'}</th>
        <th>{'Suggested Destination'}</th>
        <th>{'Suggested Vendor'}</th>
      </tr>
    </thead>
  );
}

export default PickupOrdersHeaders;
