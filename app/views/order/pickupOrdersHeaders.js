import React from 'react';
import {connect} from 'react-redux';
import {conf, pickupOrdersColumns} from './ordersColumns';
import {Headers} from '../base/table';
import HeadersRow from '../base/headers';
import {CheckBox} from '../base/input';
import * as PickupOrders from '../../modules/pickupOrders';

function stateToCheckbox(state) {
  const checkedAll = state.app.pickupOrders.checkedAll;
  return {
    checked: checkedAll,
  }
}

function mapDispatchToCheckBox(dispatch) {
  return {
    onChange: function() {
      dispatch(PickupOrders.ToggleSelectAll());
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
  const headers = Headers(conf, pickupOrdersColumns);
  return <HeadersRow items={headers} components={HeaderComponent} />
}

export default PickupOrdersHeaders;
