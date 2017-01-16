import React from 'react';
import {connect} from 'react-redux';
import {conf, inboundOrdersColumns} from './inboundOrdersColumns';
import {Headers} from '../views/base/table';
import HeadersRow from '../views/base/headers';
import {CheckBox} from '../views/base/input';
import {CheckboxHeader} from '../views/base/tableCell';
import * as InboundOrders from './inboundOrdersService';

function HeaderComponent(type, item) {
  switch(type) {
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
