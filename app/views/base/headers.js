import classNaming from 'classnames';
import lodash from 'lodash';
import React from 'react';
import styles from './table.css';

function Headers({items, components}) {
  const cells = lodash.map(items, (item) => {
    const className = classNaming(styles.th, styles[item.keyword]);
    const cell = components(item.type, item);
    return <th key={item.keyword} className={className}>{cell}</th>;
  });

  return (
    <thead>
      <tr className={styles.tr}>
        {cells}
      </tr>
    </thead>
  );
}

export default Headers;
