import React from 'react';
import {connect} from 'react-redux';
import {conf, receivedOrdersColumns} from './ordersColumns';
import {Headers} from '../base/table';
import HeadersRow from '../base/headers';
import {CheckBox} from '../base/input';
import * as OrdersPickup from '../../modules/orders/actions/received';
import * as ReceivedOrders from '../../modules/receivedOrders';

function stateToCheckbox(state) {
  const checkedAll = state.app.receivedOrders.checkedAll;
  return {
    checked: checkedAll,
  }
}

function mapDispatchToCheckBox(dispatch) {
  return {
    onChange: function() {
      dispatch(ReceivedOrders.ToggleSelectAll());
    }
  }
}

const PickupOrdersCheckBox = connect(stateToCheckbox, mapDispatchToCheckBox)(CheckBox);

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
  return <HeadersRow items={headers} components={HeaderComponent} />
}

export default PickupOrdersHeaders;
