import lodash from 'lodash';
import React from 'react';
import {push} from 'react-router-redux';
import {connect} from 'react-redux';
import {Body} from '../views/base/table';
import {conf, groupingColumns} from '../views/order/ordersColumns';
import BodyRow, {CheckBoxCell, LinkCell, TextCell, OrderIDLinkCell} from '../views/base/cells';
import * as Grouping from './groupingService';
import {formatDate, formatDateHourOnly} from '../helper/time';
import {CheckboxCell} from '../views/base/tableCell';
import styles from '../views/base/table.css';
import moment from 'moment';

const GroupingRowClass = React.createClass({
  startEditOrder(val) {
    this.props.startEditOrder(this.props.item);
  },
  render() {
    const {idx, cells} = this.props;
    return (
      <tr className={styles.tr} onClick={this.startEditOrder}>{cells}</tr>
    );
  }
});

function mapDispatchToGroupingRow(dispatch, ownParams) {
  return {
    startEditOrder: (order) => {
      dispatch(Grouping.StartEditOrder(order.UserOrderID));
    }
  }
}

const GroupingRow = connect(undefined, mapDispatchToGroupingRow)(GroupingRowClass);

function BodyComponent(type, keyword, item, index) {
  switch(type) {
    case "String": {
      if ("PackageWeight" === keyword) {
        return <TextCell text={item[keyword] + ' kg'} />
      } else {
        return <TextCell text={item[keyword]} />
      }
    }

    case "Link": {
      return <GroupingLink text={item[keyword]} item={item} to={'/orders/' + item.UserOrderID}/>
    }

    case "IDLink": {
      return <GroupingLink eds={item.UserOrderNumber} id={item.WebOrderID} item={item} to={'/orders/' + item.UserOrderID}/>
    }

    default: {
      return null;
    }
  }
}

function GroupingBody({items}) {
  const body = Body(conf, groupingColumns);

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

    return <GroupingRow key={idx} cells={cells} item={item} />
  });

  return (
    <tbody>
      {rows}
    </tbody>
  );
}

export default GroupingBody;
