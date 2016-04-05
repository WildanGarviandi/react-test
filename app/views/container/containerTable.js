import React from 'react';
import {connect} from 'react-redux';
import {ContainersAction} from '../../modules';
import {Collection, Pagination} from '../base';
import {BaseCell, BaseHeader, BaseRow} from './table';
import ActiveCell from './activeCell';

import styles from './table.css';

const ContainerTable = React.createClass({
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

    const BodyComponent = _.assign({}, HeaderComponent, {
      BaseChild: BaseCell,
      CustomChild: {status: ActiveCell}
    });

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

const stateToProps = (state) => {
  const {containers, shown, limit, currentPage, total} = state.app.containers;
  return {
    containers: _.chain(containers).map((container) => (container)).filter((container) => {
      return shown.indexOf(container.ContainerID) > -1;
    }).sortBy((container) => (container.ContainerID)).value(),
    pagination: {
      limit: limit,
      currentPage: currentPage,
      totalItem: total
    }
  }
}

const dispatchToProps = (dispatch) => {
  return {
    fetchContainer: function() {
      dispatch(ContainersAction.fetch());
    },
    setLimit: function(limit) {
      dispatch(ContainersAction.setLimit(limit));
    },
    setCurrentPage: function(page) {
      dispatch(ContainersAction.setCurrentPage(page));
    }
  }
}

export default connect(stateToProps, dispatchToProps)(ContainerTable);
