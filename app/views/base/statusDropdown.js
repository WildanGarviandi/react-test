import React from 'react';
import {connect} from 'react-redux';
import OrderStatusSelector from '../../modules/orderStatus/selector';
import {Input} from './';
import {DropdownWithState} from './dropdown';
import styles from './table.css';

function mapStateToStatusDropdown(state) {
  const initialValue = "SHOW ALL";
  const options = OrderStatusSelector.GetList(state);

  return {
    initialValue,
    options,
  };
}

export default connect(mapStateToStatusDropdown)(DropdownWithState);
