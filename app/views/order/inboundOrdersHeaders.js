import React from 'react';
import {connect} from 'react-redux';
import {conf, inboundOrdersColumns} from './ordersColumns';
import {Headers} from '../base/table';
import HeadersRow from '../base/headers';
import {CheckBox} from '../base/input';
import {CheckboxHeader} from '../base/tableCell';
import * as InboundOrders from '../../modules/inboundOrders';

function stateToCheckbox(state) {
  const {inboundOrders} = state.app;
  return {
  }
}

function mapDispatchToCheckBox(dispatch) {
  return {
  }
}

const InboundOrdersCheckBox = connect(stateToCheckbox, mapDispatchToCheckBox)(CheckboxHeader);

function HeaderComponent(type, item) {
  switch(type) {
    case "Checkbox": {
      return <InboundOrdersCheckBox />;
    }

    default: {
      return <span>{item.header.title}</span>;
    }
  }
}

function InboundOrdersHeaders() {
  const headers = Headers(conf, inboundOrdersColumns);
  return (
    <thead>
      <tr>
        <th>{'AWB'}<br/>{'(Web Order ID)'}</th>
        <th>{'Merchant'}</th>
        <th>{'Deadline'}</th>
      </tr>
    </thead>
  );
}

export default InboundOrdersHeaders;
