import classNaming from 'classnames';
import lodash from 'lodash';
import React from 'react';
import {InputWithState} from './input';
import StatusDropdown from './statusDropdown';
import styles from './table.css';

function DropdownFilterFunc(keyword, filterFunc) {
  return (val) => {
    filterFunc({[keyword]: val.value});
  };
}

function TextFilterFunc(keyword, filterFunc) {
  return (val) => {
    filterFunc({[keyword]: val});
  }
}

export function StatusFilter({keyword, filterFunc}) {
  return <StatusDropdown handleSelect={DropdownFilterFunc(keyword, filterFunc)} />
}

export function TextFilter({keyword, filterFunc}) {
  return <InputWithState styles={{input: styles.searchInput}} base={{type:"text"}} handleSelect={TextFilterFunc(keyword, filterFunc)} />;
}

function Filters({items, components}) {
  const cells = lodash.map(items, (item) => {
    const className = classNaming(styles.td, item.keyword);
    const cell = components(item.type, item);
    return <td key={item.keyword} className={className}>{cell}</td>;
  });

  return (
    <tbody>
      <tr>
        {cells}
      </tr>
    </tbody>
  );
}

export default Filters;
