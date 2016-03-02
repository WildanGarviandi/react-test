import React from 'react';
import {Modal, TableComponent} from '../base';

let columns = ['id', 'pickup', 'dropoff', 'pickup_time', 'earnings'];
let header = {
  id: 'Order ID', pickup: 'Pick Up', dropoff: 'Dropoff', pickup_time: 'Pick Up Time',
  earnings: 'Earnings', _sort: ['id', 'pickup', 'dropoff', 'pickup_time', 'earnings']
};

function CellWithCheckbox(props) {
  let { className, column, obj } = props;
  return (<td className={className} style={{color: "#37B494"}}><input type="checkbox" checked={obj._selected} />{obj[column].toString()}</td>);
}

let OrderTable = TableComponent(columns, header, {
    id: CellWithCheckbox
});

export {OrderTable};
