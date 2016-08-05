import React from 'react';
import {conf, receivedOrdersColumns} from './ordersColumns';
import {Headers} from '../base/table';
import HeadersRow from '../base/headers';
import {CheckBox} from '../base/input';

function HeaderComponent(type, item) {
  switch(type) {
    case "Checkbox": {
      return <CheckBox />;
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
