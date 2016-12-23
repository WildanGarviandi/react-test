import lodash from 'lodash';
import React from 'react';
import {push} from 'react-router-redux';
import {connect} from 'react-redux';
import {Body} from '../base/table';
import {conf, receivedOrdersColumns} from './ordersColumns';
import BodyRow, {CheckBoxCell, LinkCell, TextCell, OrderIDLinkCell} from '../base/cells';
import {ButtonWithLoading} from '../base';
import * as OrdersReceived from '../../modules/orders/actions/received';
import * as ReceivedOrders from '../../modules/receivedOrders';
import {formatDate} from '../../helper/time';
import {CheckboxCell} from '../base/tableCell';
import styles from '../base/table.css';

function mapDispatchToCheckBox(dispatch, ownProps) {
  return {
    onToggle: function(val) {
      dispatch(ReceivedOrders.ToggleSelectOne(ownProps.item.UserOrderID));
    }
  }
}

const ReceivedOrdersCheckBox = connect(undefined, mapDispatchToCheckBox)(CheckboxCell);

function mapDispatchToLink(dispatch, ownParams) {
  return {
    onToggle: function() {
      dispatch(push('/orders/' + ownParams.item.UserOrderID));
    }
  }
}

const PickupOrdersLink = connect(undefined, mapDispatchToLink)(OrderIDLinkCell);

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
      return <ReceivedOrdersCheckBox isChecked={item[keyword]} item={item} />
    }

    case "Link": {
      return <PickupOrdersLink text={item[keyword]} item={item} to={'/orders/' + item.UserOrderID}/>
    }

    case "IDLink": {
      return <PickupOrdersLink eds={item.UserOrderNumber} id={item.WebOrderID} item={item} to={'/orders/' + item.UserOrderID}/>
    }

    case "Datetime": {
      return <TextCell text={formatDate(item[keyword])} />
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

    case "Array": {
      const items = _.map(item[keyword], (val, index) => {
        return <p key={index} style={{margin: 0}}>{val}</p>
      });
      return <TextCell text={items} />
    }

    default: {
      return null;
    }
  }
}

function PickupOrdersBody({items}) {
  const body = Body(conf, receivedOrdersColumns);

  const rows = lodash.map(items, (item, idx) => {
    const cells = lodash.map(body, (column) => {
      const cell = BodyComponent(column.type, column.keyword, item, idx);
      const className = styles.td + ' ' + styles[column.keyword];

      let style = {};
      if (item.IsChecked && column.type !== "Checkbox") {
        style.color = '#fff';
        style.backgroundColor = '#ff5a60';
      }

      return <td key={column.keyword} style={style} className={className}>{cell}</td>;
    });

    return <tr key={idx} className={styles.tr}>{cells}</tr>
  });

  return (
    <tbody>
      {rows}
    </tbody>
  );
}

export default PickupOrdersBody;
