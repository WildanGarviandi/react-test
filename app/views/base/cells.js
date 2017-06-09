import classNaming from 'classnames';
import lodash from 'lodash';
import React from 'react';
import {Link} from 'react-router';
import {CheckBox} from './input';
import styles from './table.scss';
import {ButtonStandard} from './index';
import ReactTooltip from 'react-tooltip'

export function TextCell({text}) {
  return <span>{text}</span>;
}

export function LinkCell({onClick, text, to}) {
  return <Link to={to} className={styles.link}>{text}</Link>;
}

export function OrderIDLinkCell({onClick, eds, id, to, isChecked, item}) {
  return (
    <Link to={to} className={styles.link}>
      <span className={styles.hoverUnderline}>
        {eds}<br />({id})
      </span>
    </Link>
  );
}

export function ButtonCell({value, onClick}) {
  const buttonAction = {
    textBase: value,
    onClick: onClick,
    styles: {
      base: styles.cellButton
    }
  }

  return (
    <div style={{textAlign: 'center'}}>
      <ButtonStandard {...buttonAction} />
    </div>
  );
}

export function IDCell({text, onClickDetails, onClickModals}) {
  return (
    <div style={{textAlign: 'center'}}>
      <ReactTooltip />
      <div data-tip="Quick look" onClick={onClickModals} className={styles.detailsInfo}>
        <img className={styles.detailsSearchIcon} src="/img/icon-search-color.png" />
      </div>
      <div onClick={onClickDetails} className={styles.detailsID}>
        TRIP-{text}
      </div>
    </div>
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
