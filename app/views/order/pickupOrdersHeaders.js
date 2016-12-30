import React from 'react';
import {connect} from 'react-redux';
import {conf, pickupOrdersColumns} from './ordersColumns';
import {Headers} from '../base/table';
import HeadersRow from '../base/headers';
import {CheckBox} from '../base/input';
import {CheckboxHeader} from '../base/tableCell';
import * as PickupOrders from '../../modules/pickupOrders';

function stateToCheckbox(state) {
  const checkedAll = state.app.pickupOrders.checkedAll;
  return {
    isChecked: checkedAll,
  }
}

function mapDispatchToCheckBox(dispatch) {
  return {
    onToggle: function() {
      dispatch(PickupOrders.ToggleSelectAll());
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
  const headers = Headers(conf, pickupOrdersColumns);
  return (
    <thead>
      <tr>
        <PickupOrdersCheckBox />
        <th>{'AWB'}<br/>{'(Web Order ID)'}</th>
        <th>{'Merchant'}</th>
        <th>{'Weight'}</th>
        <th>{'Pick Up Address'}</th>
        <th>{'City'}</th>
        <th>{'ZIP Code'}</th>
        <th>{'Deadline'}</th>
        <th>{'Status'}</th>
      </tr>
    </thead>
  );
}

export default PickupOrdersHeaders;
