import React from 'react';
import {connect} from 'react-redux';
import {conf, receivedOrdersColumns} from './ordersColumns';
import {Headers} from '../base/table';
import HeadersRow from '../base/headers';
import {CheckBox} from '../base/input';
import * as OrdersPickup from '../../modules/orders/actions/received';

function mapDispatchToCheckBox(dispatch) {
  return {
    onChange: function(val) {
      dispatch(OrdersPickup.setSelectedAll(val));
    }
  }
}

const PickupOrdersCheckBox = connect(undefined, mapDispatchToCheckBox)(CheckBox);

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
