import React from 'react';
import {connect} from 'react-redux';
import classNaming from 'classnames';
import {StatusList} from '../../modules';
import {Dropdown, DropdownTypeAhead} from '../base';
import styles from './table.css';

const TripStatusSelect = React.createClass({
  selectVal(val) {
    const {pick, nameToID} = this.props;
    pick(nameToID[val], val.toUpperCase());
  },
  render() {
    const {statusName} = this.props;
    return (<td className={classNaming(styles.td, styles.search)} style={{width: 150}}><DropdownTypeAhead options={this.props.statusList} selectVal={this.selectVal} val={statusName} /></td>);
  }
});

const stateToProps = (state) => {
  const {statusList} = state.app.containers;
  return {
    statusList: _.chain(statusList).map((key, val) => [val, key]).sortBy((arr) => (arr[1])).map((arr) => (arr[0])).value(),
    nameToID: _.reduce(statusList, (memo, key, val) => {
      memo[val] = key;
      return memo;
    }, {}),
    statusName: state.app.containerList.myContainer.statusName,
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
