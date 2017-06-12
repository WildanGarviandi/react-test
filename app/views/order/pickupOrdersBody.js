import lodash from 'lodash';
import React from 'react';
import {push} from 'react-router-redux';
import {connect} from 'react-redux';
import {Body} from '../base/table';
import {conf, pickupOrdersColumns} from './ordersColumns';
import BodyRow, {CheckBoxCell, LinkCell, TextCell, OrderIDLinkCell} from '../base/cells';
import * as OrdersPickup from '../../modules/orders/actions/pickup';
import * as PickupOrders from '../../modules/pickupOrders';
import {formatDate} from '../../helper/time';
import {CheckboxCell} from '../base/tableCell';
import styles from '../base/table.scss';

function mapDispatchToCheckBox(dispatch, ownProps) {
  return {
    onToggle: function(val) {
      dispatch(PickupOrders.ToggleSelectOne(ownProps.item.UserOrderID));
    }
  }
}

const PickupOrdersCheckBox = connect(undefined, mapDispatchToCheckBox)(CheckboxCell);

function mapDispatchToLink(dispatch, ownParams) {
  return {
    onClick: function() {
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
      let color, status, imgUrl;

      if(item["OrderStatus"] === "NOTASSIGNED") {
        color = "#C33";
        status = 'Ready';
        imgUrl = item.IsChecked ? '/img/icon-ready-white.png' : '/img/icon-ready.png';
      } else if(item["OrderStatus"] === "BOOKED") {
        color = "#000";
        status = 'Not Ready';
        imgUrl = item.IsChecked ? '/img/icon-not-ready-white.png' : '/img/icon-not-ready.png';
      }

      const imgStyle = {
        width: 24,
        height: 24,
        display: 'inline-block',
        float: 'left'
      }

      return (
        <span style={{display: 'inline-block', width: 100}}>
          <img src={imgUrl} style={imgStyle}/>
          <span style={{lineHeight: '25px'}}>
            <TextCell text={status} />
          </span>
        </span>
      );
    }

    case "Checkbox": {
      return <PickupOrdersCheckBox isChecked={item[keyword]} item={item} />
    }

    case "Link": {
      return <PickupOrdersLink text={item[keyword]} item={item} to={'/orders/' + item.UserOrderID}/>
    }

    case "IDLink": {
      return <PickupOrdersLink eds={item.UserOrderNumber} id={item.WebOrderID} item={item} to={'/orders/' + item.UserOrderID}/>
    }

    case "Datetime": {
      switch(keyword) {
        case "PickupTime": {
          let color, back;

          return <span style={{color: color, backgroundColor: back}}>
                    <TextCell text={formatDate(item[keyword])} />
                  </span>
        }
        default: {
          return <TextCell text={formatDate(item[keyword])} />
        }
      }
    }

    default: {
      return null;
    }
  }
}

function PickupOrdersBody({items}) {
  const body = Body(conf, pickupOrdersColumns);

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
