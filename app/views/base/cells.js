import classNaming from 'classnames';
import lodash from 'lodash';
import React from 'react';
import {Link} from 'react-router';
import {CheckBox} from './input';
import styles from './table.css';

export function TextCell({text}) {
  return <span>{text}</span>;
}

export function LinkCell({onClick, text, to}) {
  return <Link to={to} className={styles.link}>{text}</Link>;
}

export function OrderIDLinkCell({onClick, eds, id, to, isChecked, item}) {
  let style = {
    textAlign: 'center',
    color: '#000',
    display: 'inline-block'
  }

  if (item && item.IsChecked) {
    style.color = '#fff';
    style.backgroundColor = '#ff5a60';
  }

  return (
    <Link to={to} className={styles.link}>
      <span style={style}>
        {eds}<br />{id}
      </span>
    </Link>
  );
}

export const CheckBoxCell = CheckBox;

export default function Body({columns, items, components}) {
  const rows = lodash.map(items, (item, idx) => {
    const cells = lodash.map(columns, (column) => {
      const cell = components(column.type, column.keyword, item, idx);
      const className = classNaming(styles.td, styles[column.keyword]);
      return <td key={column.keyword} className={className}>{cell}</td>;
    });

    return <tr key={idx} className={styles.tr}>{cells}</tr>
  });

  return (
    <tbody>
      {rows}
    </tbody>
  );
}
