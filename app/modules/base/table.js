import React from 'react';
import _ from 'underscore';
import * as utils from './utils';
import {Glyph} from './glyph';

import styles from './table.css';

function TableComponent(columns, header, dispatcher = {}) {
  const BaseBodyCell = ({column, obj}) => {
    return (<td className={styles.td}>{utils.ObjectFieldValue(obj, column).toString()}</td>);
  }

  const BaseHeaderCell = ({column, obj}) => {
    return (
      <th className={styles.th}>
        <span>{utils.ObjectFieldValue(obj, column).toString()}</span>
      </th>
    );
  }

  const BaseHeaderRow = () => {
    let cols = _.map(columns, (column) => {
      return (<BaseHeaderCell key={column} column={column} obj={header} />);
    });

    return (<tr>{cols}</tr>);
  }

  const BaseBodyRow = ({obj}) => {
    let cols = columns.map((column) => {
      if(column in dispatcher) {
        let Component = dispatcher[column];
        return (<Component className={styles.td} key={column} column={column} obj={obj} />);
      } else {
        return (<BaseBodyCell key={column} column={column} obj={obj} />);
      }
    });

    return (<tr className={styles.tr}>{cols}</tr>);
  }

  function TableBody(props) {
    let { objs } = props;
    let rows = objs.map((obj) => {
      return (<BaseBodyRow key={obj.id} obj={obj} />);
    });

    return (<tbody>{rows}</tbody>);
  }

  function Table(props) {
    let {data} = props;

    return (
      <table className={styles.table}>
        <thead>
          <BaseHeaderRow />
        </thead>
        <TableBody objs={data} />
      </table>
    );
  }

  return Table;
}

function Modal(props) {
  var wrapperStyle = {
    position: 'absolute',
    top: '-300px',
    left: '-100000px',
    right: '-100000px',
    bottom: '0',
    zIndex: '1000',
    display: (props.show ? "block": "none")
  };
  var backdropStyle = {backgroundColor: '#000', opacity:'0.5', width: '100%', height: '100%', top: 0, left: 0, position: 'absolute'};
  var modalStyle = {
    borderRadius: '10px',
    width: '1000px',
    backgroundColor: '#fff',
    position: 'absolute',
    padding: '20px',
    left: 0,
    right: 0,
    top: '200px',
    margin: '0 auto',
    marginTop: '180px',
    width: (props.width ? props.width : "500px")
  }

  return (
    <div style={wrapperStyle}>
      <div style={backdropStyle}></div>
      <div style={modalStyle}>
        {props.children}
      </div>
    </div>
  );
}

export { Modal, TableComponent };
