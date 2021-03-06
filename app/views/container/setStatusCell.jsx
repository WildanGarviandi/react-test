import React from 'react';
import {connect} from 'react-redux';
import classNaming from 'classnames';
import {StatusList} from '../../modules';
import {Dropdown, DropdownTypeAhead} from '../base';
import styles from './table.scss';

const TripStatusSelect = React.createClass({
  selectVal(val) {
    this.props.pick(val.key, val.value.toUpperCase());
  },
  render() {
    const {statusName} = this.props;
    return (
      <td className={classNaming(styles.td, styles.search)} style={{width: 150}}>
        <DropdownTypeAhead options={this.props.statusList} selectVal={this.selectVal} val={statusName} />
      </td>
    );
  }
});

const stateToProps = (state) => {
  const {statusList} = state.app.containers;
  return {
    statusList: _.chain(statusList)
      .map((key, val) => ({key:key, value: val}))
      .sortBy((arr) => (arr.key))
      .value(),
    statusName: state.app.containers.statusName,
  }
}

const dispatchToProps = (dispatch) => {
  return {
    pick: function(val, name) {
      dispatch(StatusList.pick([val], name));
    },
  };
}

export default connect(stateToProps, dispatchToProps)(TripStatusSelect);
