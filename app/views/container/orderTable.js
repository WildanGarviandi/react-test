import React from 'react';
import {connect} from 'react-redux';
import {ContainersAction} from '../../modules';
import {Collection, Pagination} from '../base';
import {BaseCell, BaseHeader, BaseRow} from './table';

import styles from './table.css';

export default React.createClass({
  componentDidMount() {
    this.props.fetchContainer();
  },
  setCurrentPage(x) {
    this.props.setCurrentPage(x);
  },
  setLimit(x) {
    this.props.setLimit(x);
  },
  render() {
    const columns = ['ContainerID', 'ContainerNumber', 'Driver', 'status'];
    const header = { ContainerID: 'Container ID', ContainerNumber: 'Container Number', Driver: 'Driver', status: 'Active'};
    const {containers, pagination} = this.props;
    const items = containers;

    const HeaderComponent = {
      BaseParent: BaseRow,
      BaseChild: BaseHeader,
      CustomChild: {},
      Columns: columns
    };

    const Header = <Collection item={header} components={HeaderComponent} />

    const BodyComponent = {
      BaseParent: PickRow,
      BaseChild: BaseCellGray,
      CustomChild: {status: ActiveCell},
      Columns: columns
    };

    const Body = _.map(items, (item) => {
      return <Collection key={item.ContainerID} item={item} components={BodyComponent} />
    });

    return (
      <div>
        <table className={styles.table}>
          <thead>{Header}</thead>
          <tbody>{Body}</tbody>
        </table>
        <Pagination {...pagination} setCurrentPage={this.setCurrentPage} setLimit={this.setLimit} />
      </div>
    );
  }
});
