import React from 'react';
import {connect} from 'react-redux';
import classNaming from 'classnames';
import {ContainerListAction} from '../../modules';
import styles from './table.css';

const ActiveCell = React.createClass({
  handleToggle() {
    const {item, toggleActive} = this.props;
    toggleActive(item.ContainerID);
  },
  render() {
    const {item, attr} = this.props;
    const name = classNaming(styles.checkbox, styles[item[attr]]);
    const tdName = classNaming(styles.td, {[styles.gray]: item.status == 'NotActive'});

    return (<td className={tdName} style={{width: '40px', textAlign: 'center'}}><span className={name} onClick={this.handleToggle} /></td>);
  }
});

const ActiveCellDispatch = (dispatch) => {
  return {
    toggleActive: function(id) {
      dispatch(ContainerListAction.toggleActive(id));
    }
  }
}

export default connect(undefined, ActiveCellDispatch)(ActiveCell);
