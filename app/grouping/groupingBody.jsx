import React from 'react';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';

import * as _ from 'lodash';
import PropTypes from 'prop-types';

import { Body } from '../views/base/table';
import { conf, groupingColumns } from './groupingColumns';
import { TextCell, OrderIDLinkCell } from '../views/base/cells';
import styles from '../views/base/table.scss';
import groupingStyle from './styles.scss';

function mapDispatchToLink(dispatch, ownParams) {
  const dispatchFunc = {
    onClick: () => {
      dispatch(push(`/orders/${ownParams.item.UserOrderID}`));
    },
  };

  return dispatchFunc;
}

const GroupingLink = connect(undefined, mapDispatchToLink)(OrderIDLinkCell);

function BodyComponent(type, keyword, item) {
  switch (type) {
    case 'String': {
      if (keyword === 'PackageWeight') {
        return <TextCell text={`${item[keyword]} kg`} />;
      }
      return <TextCell text={item[keyword]} />;
    }

    case 'Link': {
      return <GroupingLink text={item[keyword]} item={item} to={`/orders/${item.UserOrderID}`} />;
    }

    case 'IDLink': {
      return <GroupingLink eds={item.UserOrderNumber} id={item.WebOrderID} item={item} to={`/orders/${item.UserOrderID}`} />;
    }

    default: {
      return null;
    }
  }
}

function GroupingBody({ items }) {
  const body = Body(conf, groupingColumns);

  const rows = _.map(items, (item, idx) => {
    const cells = _.map(body, (column) => {
      const cell = BodyComponent(column.type, column.keyword, item);
      const className = `${styles.td} ${styles[column.keyword]}`;

      const style = {};
      if (item.IsChecked && column.type !== 'Checkbox') {
        style.color = '#fff';
        style.backgroundColor = '#ff5a60';
      }

      return <td key={column.keyword} style={style} className={className}>{cell}</td>;
    });

    return <tr className={`${styles.tr} ${groupingStyle.noPointer}`} key={idx}>{cells}</tr>;
  });
  return (
    <tbody>
      {rows}
    </tbody>
  );
}

/* eslint-disable */
GroupingBody.propTypes = {
  items: PropTypes.array,
}
/* eslint-enable */

GroupingBody.defaultProps = {
  items: [],
};

export default GroupingBody;
