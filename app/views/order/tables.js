import React from 'react';
import _ from 'underscore';
import {Tables} from '../base';

let columns = ['id', 'pickup', 'dropoff', 'pickup_time', 'earnings'];

export const CellWithLink = ({className, val}) => {
  return (<td className={className} style={{color: "#37B494"}}>{val}</td>);
}

export const CellWithCheckbox = ({checked, className, val}) => {
  return (<td className={className} style={{color: "#37B494", width: '90px'}}><input type={'checkbox'} checked={checked} readOnly/>{val}</td>);
}

export const CellWithNums = ({className, val}) => {
  return (<td className={className} style={{textAlign: "right", width: '70px'}}>{val}</td>);
}

export const CellWithSelected = ({active, className, val}) => {
  return (<td className={className} style={active ? {backgroundColor: '#286090', color: '#fff'} : {}}>{val}</td>);
}

export const CellWithStatus = ({active, className, val, yeah}) => {
  let sty = {
    backgroundColor: 'transparent'
  };

  if(yeah.status == 'success') {
    sty.backgroundColor = 'green';
    sty.color = 'white';
  } else if(yeah.status == 'failed') {
    sty.backgroundColor = 'red';
    sty.color = 'white';
  }

  return (<td className={className} style={sty}>{val}</td>);
}

export const CellForContainer = ({className, val}) => {
  return (<td className={className} style={{textAlign: "center", width: '70px'}}>{val}</td>);
}

let TableWithoutSearch = Tables(columns, {
  id: { comps: CellWithCheckbox },
}, { withoutSearch: true });

export {Tables, TableWithoutSearch};
