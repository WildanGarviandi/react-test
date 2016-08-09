import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Body} from '../base/table';
import {conf, pickupOrdersColumns} from './ordersColumns';
import BodyRow, {CheckBoxCell, LinkCell, TextCell} from '../base/cells';
import * as OrdersPickup from '../../modules/orders/actions/pickup';

function mapDispatchToCheckBox(dispatch, ownProps) {
  return {
    onChange: function(val) {
      dispatch(OrdersPickup.setSelected([ownProps.index], val));
    }
  }
}

const PickupOrdersCheckBox = connect(undefined, mapDispatchToCheckBox)(CheckBoxCell);

function BodyComponent(type, keyword, item, index) {
  switch(type) {
    case "String": {
      return <TextCell text={item[keyword]} />
    }

    case "Checkbox": {
      return <PickupOrdersCheckBox checked={item[keyword]} index={index} />
    }

    case "Link": {
      return <LinkCell text={item[keyword]} onClick={() => (3)} />
    }

    default: {
      return null;
    }
  }
}

function PickupOrdersBody({items}) {
  const body = Body(conf, pickupOrdersColumns);
  return <BodyRow columns={body} items={items} components={BodyComponent} />
}

export default PickupOrdersBody;
