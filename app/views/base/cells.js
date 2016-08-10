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
  console.log('to', to);
  return <Link to={to} className={styles.link}>{text}</Link>;
}

export const CheckBoxCell = CheckBox;

export default function Body({columns, items, components}) {
  const rows = lodash.map(items, (item, idx) => {
    const cells = lodash.map(columns, (column) => {
      const cell = components(column.type, column.keyword, item, idx);
      const className = classNaming(styles.td, column.keyword);
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
