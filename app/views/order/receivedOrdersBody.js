import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Body} from '../base/table';
import {conf, receivedOrdersColumns} from './ordersColumns';
import BodyRow, {CheckBoxCell, LinkCell, TextCell} from '../base/cells';
import {ButtonWithLoading} from '../base';
import * as OrdersReceived from '../../modules/orders/actions/received';

function mapDispatchToCheckBox(dispatch, ownProps) {
  return {
    onChange: function(val) {
      dispatch(OrdersReceived.setSelected([ownProps.index], val));
    }
  }
}

const ReceivedOrdersCheckBox = connect(undefined, mapDispatchToCheckBox)(CheckBoxCell);

function BodyComponent(type, keyword, item) {
  switch(type) {
    case "String": {
      return <TextCell text={item[keyword]} />
    }

    case "Checkbox": {
      return <ReceivedOrdersCheckBox checked={item[keyword]} index={index} />
    }

    case "Link": {
      return <LinkCell text={item[keyword]} onClick={() => (3)} />
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
