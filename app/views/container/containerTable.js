import React from 'react';
import {connect} from 'react-redux';
import {ContainerListAction} from '../../modules';
import {Collection} from '../base';
import {BaseCell, BaseHeader, BaseRow} from './table';
import ActiveCell from './activeCell';

import styles from './table.css';

const ContainerTable = React.createClass({
  componentDidMount() {
    this.props.fetchContainer();
  },
  render() {
    const columns = ['ContainerID', 'ContainerNumber', 'Driver', 'status'];
    const header = { ContainerID: 'Container ID', ContainerNumber: 'Container Number', Driver: 'Driver', status: 'Active'};
    const items = this.props.containers;

    const HeaderComponent = {
      BaseParent: BaseRow,
      BaseChild: BaseHeader,
      CustomChild: {},
      Columns: columns
    };

    const Header = <Collection item={header} components={HeaderComponent} />

    const BodyComponent = _.assign({}, HeaderComponent, {
      BaseChild: BaseCell,
      CustomChild: {status: ActiveCell}
    });
    const Body = _.map(items, (item) => {
      return <Collection key={item.ContainerID} item={item} components={BodyComponent} />
    });

    return (
      <table className={styles.table}>
        <thead>{Header}</thead>
        <tbody>{Body}</tbody>
      </table>
    );
  }
});

const stateToProps = (state) => {
  const {containers} = state.app.containers;
  return {
    containers: _.chain(containers).map((container) => (container)).sortBy((container) => (container.ContainerID)).value()
  }
}

const dispatchToProps = (dispatch) => {
  return {
    fetchContainer: function() {
      dispatch(ContainerListAction.fetch());
    }
  }
}

export default connect(stateToProps, dispatchToProps)(ContainerTable);
