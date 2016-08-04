import React from 'react';
import {headers} from './pickupOrdersColumns';
import Headers from '../base/headers';
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
  return <Headers items={headers} components={HeaderComponent} />
}

export default PickupOrdersHeaders;
