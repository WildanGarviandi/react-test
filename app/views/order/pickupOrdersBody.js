import lodash from 'lodash';
import React from 'react';
import {Body} from '../base/table';
import {conf, pickupOrdersColumns} from './ordersColumns';
import BodyRow, {CheckBoxCell, LinkCell, TextCell} from '../base/cells';

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
