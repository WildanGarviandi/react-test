import lodash from 'lodash';
import React from 'react';
import {push} from 'react-router-redux';
import {connect} from 'react-redux';
import {Body} from '../views/base/table';
import {conf, groupingColumns} from './groupingColumns';
import BodyRow, {CheckBoxCell, LinkCell, TextCell, OrderIDLinkCell} from '../views/base/cells';
import * as Grouping from './groupingService';
import {formatDate, formatDateHourOnly} from '../helper/time';
import {CheckboxCell} from '../views/base/tableCell';
import styles from '../views/base/table.css';
import moment from 'moment';

function mapDispatchToLink(dispatch, ownParams) {
  return {
    onClick: function() {
      dispatch(push('/orders/' + ownParams.item.UserOrderID));
    }
  }
}

const GroupingLink = connect(undefined, mapDispatchToLink)(OrderIDLinkCell);

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

    return <tr className={styles.tr} key={idx}>{cells}</tr>
  });

  return (
    <tbody>
      {rows}
    </tbody>
  );
}

export default GroupingBody;
