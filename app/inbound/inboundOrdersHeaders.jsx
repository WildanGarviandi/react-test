import React from 'react';

import { conf, inboundOrdersColumns } from './inboundOrdersColumns';
import { Headers } from '../views/base/table';

function HeaderComponent(type, item) {
  switch (type) {
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
        <th>{'AWB'}<br />{'(Web Order ID)'}</th>
        <th>{'Merchant'}</th>
        <th>{'Deadline'}</th>
      </tr>
    </thead>
  );
}

export default InboundOrdersHeaders;
