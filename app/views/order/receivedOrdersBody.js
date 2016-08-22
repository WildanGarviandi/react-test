import lodash from 'lodash';
import React from 'react';
import {push} from 'react-router-redux';
import {connect} from 'react-redux';
import {Body} from '../base/table';
import {conf, receivedOrdersColumns} from './ordersColumns';
import BodyRow, {CheckBoxCell, LinkCell, TextCell} from '../base/cells';
import {ButtonWithLoading} from '../base';
import * as OrdersReceived from '../../modules/orders/actions/received';
import * as ReceivedOrders from '../../modules/receivedOrders';

function mapDispatchToCheckBox(dispatch, ownProps) {
  return {
    onChange: function(val) {
      dispatch(ReceivedOrders.ToggleSelectOne(ownProps.item.UserOrderID));
    }
  }
}

const ReceivedOrdersCheckBox = connect(undefined, mapDispatchToCheckBox)(CheckBoxCell);

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
      return <ReceivedOrdersCheckBox checked={item[keyword]} item={item} />
    }

    case "Link": {
      return <PickupOrdersLink text={item[keyword]} item={item} to={'/orders/' + item.UserOrderID}/>
    }

    case "Actions": {
      const missingActions = {
        textBase: "Set as missing",
        textLoading: "Consolidating Orders",
        isLoading: false,
        onClick: () => null,
      }

      return (
        <div style={{textAlign: 'center'}}>
          <ButtonWithLoading {...missingActions} />
        </div>
      );
    }

    default: {
      return null;
    }
  }
}

function PickupOrdersBody({items}) {
  const body = Body(conf, receivedOrdersColumns);
  return <BodyRow columns={body} items={items} components={BodyComponent} />
}

export default PickupOrdersBody;
