import React from 'react';
import {connect} from 'react-redux';
import {conf, updateOrdersColumns} from '../views/order/ordersColumns';
import {Headers} from '../views/base/table';
import HeadersRow from '../views/base/headers';
import {CheckBox} from '../views/base/input';
import {CheckboxHeader} from '../views/base/tableCell';
import * as UpdateOrders from './updateOrders';

function stateToCheckbox(state) {
  const {updateOrders} = state.app;
  return {
  }
}

function mapDispatchToCheckBox(dispatch) {
  return {
  }
}

const UpdateOrdersCheckBox = connect(stateToCheckbox, mapDispatchToCheckBox)(CheckboxHeader);

function HeaderComponent(type, item) {
  switch(type) {
    case "Checkbox": {
      return <UpdateOrdersCheckBox />;
    }

    default: {
      return <span>{item.header.title}</span>;
    }
  }
}

function UpdateOrdersHeaders() {
  const headers = Headers(conf, updateOrdersColumns);
  return (
    <thead>
      <tr>
        <th>{'AWB'}<br/>{'(Web Order ID)'}</th>
        <th>{'Length'}<br/>{'(cm)'}</th>
        <th>{'Width'}<br/>{'(cm)'}</th>
        <th>{'Height'}<br/>{'(cm)'}</th>
        <th>{'Weight'}<br/>{'(kg)'}</th>
        <th>Deadline</th>
      </tr>
    </thead>
  );
}

export default UpdateOrdersHeaders;
