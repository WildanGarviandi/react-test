import React from 'react';
import {connect} from 'react-redux';
import OrderStatusSelector from '../../modules/orderStatus/selector';
import {Input} from './';
import {DropdownWithState2} from './dropdown';
import styles from './table.scss';

function mapStateToStatusDropdown(state, ownProps) {
  const val = ownProps.val;
  const options = OrderStatusSelector.GetList(state);

  return {
    val,
    options,
  };
}

export default connect(mapStateToStatusDropdown)(DropdownWithState2);
