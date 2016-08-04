import lodash from 'lodash';
import React from 'react';
import {body} from './pickupOrdersColumns';
import BodyRow, {CheckBoxCell, TextCell} from '../base/cells';

function BodyComponent(type, keyword, item) {
  switch(type) {
    case "String": {
      return <TextCell text={item[keyword]} />
    }

    case "Checkbox": {
      return <CheckBoxCell checked={item[keyword]} />
    }

    default: {
      return null;
    }
  }
}

function PickupOrdersBody({items}) {
  return <BodyRow columns={body} items={items} components={BodyComponent} />
}

export default PickupOrdersBody;
