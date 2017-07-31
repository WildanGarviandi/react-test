import React from 'react';

import { conf, groupingColumns } from './groupingColumns';
import { Headers } from '../views/base/table';

function HeaderComponent(type, item) {
  switch (type) {
    case 'Checkbox': {
      return <GroupingCheckBox />;
    }

    default: {
      return <span>{item.header.title}</span>;
    }
  }
}

function GroupingHeaders() {
  const headers = Headers(conf, groupingColumns);
  return (
    <thead>
      <tr>
        <th>AWB<br />(Web Order ID)</th>
        <th>Merchant</th>
        <th>Weight</th>
        <th>Drop Off Address</th>
        <th>City</th>
        <th>ZIP Code</th>
        <th>Suggested Destination</th>
      </tr>
    </thead>
  );
}

export default GroupingHeaders;
