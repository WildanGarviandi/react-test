import lodash from 'lodash';
import React from 'react';
import {push} from 'react-router-redux';
import {connect} from 'react-redux';
import {Body} from '../base/table';
import {conf, pickupOrdersColumns} from './ordersColumns';
import BodyRow, {CheckBoxCell, LinkCell, TextCell} from '../base/cells';
import * as OrdersPickup from '../../modules/orders/actions/pickup';
import * as PickupOrders from '../../modules/pickupOrders';

function mapDispatchToCheckBox(dispatch, ownProps) {
  return {
    onChange: function(val) {
      dispatch(PickupOrders.ToggleSelectOne(ownProps.item.UserOrderID));
    }
  }
}

const PickupOrdersCheckBox = connect(undefined, mapDispatchToCheckBox)(CheckBoxCell);

function mapDispatchToLink(dispatch, ownParams) {
  return {
    onClick: function() {
      dispatch(push('/orders/' + ownParams.item.UserOrderID));
    }
  }
}

const PickupOrdersLink = connect(undefined, mapDispatchToLink)(LinkCell);

function BodyComponent(type, keyword, item, index) {
  switch(type) {
    case "String": {
      return <TextCell text={item[keyword]} />
    }

    case "Status": {
      let color;

      if(item["OrderStatus"] === "NOTASSIGNED") {
        color = "#C33"
      } else if(item["OrderStatus"] === "BOOKED") {
        color = "#f0ad4e";
      } else {
        color = "#000";
      }

      return <span style={{color: color}}><TextCell text={item[keyword]} /></span>
    }

    case "Checkbox": {
      return <PickupOrdersCheckBox checked={item[keyword]} item={item} />
    }

    case "Link": {
      return <PickupOrdersLink text={item[keyword]} item={item} to={'/orders/' + item.UserOrderID}/>
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
