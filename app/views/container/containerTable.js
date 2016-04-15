import React from 'react';
import {connect} from 'react-redux';
import {ContainersAction} from '../../modules';
import {Collection, Pagination, ButtonBase, ButtonAction} from '../base';
import {BaseCellGray, BaseHeader, BaseRow, SearchCell} from './table';
import ActiveCell from './activeCell';
import PickRow from './pickContainerRow';
import SetStatusCell from './setStatusCell';

import styles from './table.css';

const ActionCell = React.createClass({
  handleClick(e) {
    const {item} = this.props;
    const qrCodeLink = '/qrcode/' + item.ContainerNumber;
    window.open(qrCodeLink);
    e.preventDefault();
    e.stopPropagation();
  },
  render() {
    return (
      <td className={styles.td} style={{width: '40px', textAlign: 'center'}}>
        <a href='javascript:;' onClick={this.handleClick}>
          <ButtonAction>Print</ButtonAction>
        </a>
      </td>
    );
  }
});

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
    const columns = ['ContainerNumber', 'OrderCount', 'ContainerStatus', 'Driver', 'District', 'status', 'action'];
    const header = {
      ContainerNumber: 'Container Number', 
      OrderCount: 'Number of Orders',
      ContainerStatus: 'Status',
      Driver: 'Driver', 
      District: 'District',
      status: 'Active', 
      action: 'Action'
    };

    const {containers, isFetching, pagination} = this.props;
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
      CustomChild: {
        status: ActiveCell,
        action: ActionCell
      },
      Columns: columns
    };

    const Body = _.map(items, (item) => {
      return <Collection key={item.ContainerID} item={item} components={BodyComponent} />
    });

    return (
      <div>
        <Pagination {...pagination} setCurrentPage={this.setCurrentPage} setLimit={this.setLimit} />
        <table className={styles.table} style={isFetching ? {opacity: 0.5} : {}}>
          <thead>{Header}</thead>
          <tbody>
            <tr>
              <SearchCell />
              <td className={styles.td} />
              <SetStatusCell />
              <td className={styles.td} />
              <td className={styles.td} />
              <td className={styles.td} />
              <td className={styles.td} />
            </tr>
          </tbody>
          <tbody>{Body}</tbody>
        </table>
      </div>
    );
  }
});

const stateToProps = (state) => {
  const {containers, isFetching, shown, limit, currentPage, total} = state.app.containers;
  return {
    containers: _.chain(containers).map((container) => {
      if(!container.CurrentTrip) return _.assign({}, container, {
        OrderCount: 0
      });

      return _.assign({}, container, {
        ContainerStatus: container.CurrentTrip.OrderStatus.OrderStatus,
        District: (container.CurrentTrip.District && container.CurrentTrip.District.Name) || '',
        OrderCount: (container.CurrentTrip.UserOrderRoutes && container.CurrentTrip.UserOrderRoutes.length) || 0
      });
    }).filter((container) => {
      return shown.indexOf(container.ContainerID) > -1;
    }).sortBy((container) => (container.ContainerID)).value(),
    pagination: {
      limit: limit,
      currentPage: currentPage,
      totalItem: total
    },
    isFetching: isFetching,
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
    },    
  }
}

export default connect(stateToProps, dispatchToProps)(ContainerTable);
