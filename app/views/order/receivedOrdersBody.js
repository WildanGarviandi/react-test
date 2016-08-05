import lodash from 'lodash';
import React from 'react';
import {Body} from '../base/table';
import {conf, receivedOrdersColumns} from './ordersColumns';
import BodyRow, {CheckBoxCell, LinkCell, TextCell} from '../base/cells';
import {ButtonWithLoading} from '../base';

function BodyComponent(type, keyword, item) {
  switch(type) {
    case "String": {
      return <TextCell text={item[keyword]} />
    }

    case "Checkbox": {
      return <CheckBoxCell checked={item[keyword]} />
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
