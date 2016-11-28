import classNaming from 'classnames';
import lodash from 'lodash';
import React from 'react';
import {CheckBox} from './input';
import styles from './style.css';

export function Row({label, text}) {
  return (
    <div className={styles.itemRow}>
      <span className={styles.itemLabel}>{label}</span>
      <span className={styles.itemValue}>{text}</span>
    </div>
  );
}

export default function List({items, components}) {
  const rows = lodash.map(items, (item, idx) => {
    const cells = lodash.map(columns, (column) => {
      const cell = components(column.type, column.keyword, item);
      const className = classNaming(styles.td, column.keyword);
      return <span key={column.keyword} className={className}>{cell}</span>;
    });

    return <tr key={idx} className={styles.tr}>{cells}</tr>
  });

  return (
    <tbody>
      {rows}
    </tbody>
  );
}
