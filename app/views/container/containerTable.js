import React from 'react';
import {connect} from 'react-redux';
import {ContainersAction, StatusList} from '../../modules';
import {Collection, Infograph, Pagination, ButtonBase, ButtonAction} from '../base';
import {BaseCellGray, BaseHeader, BaseRow, SearchCell} from './table';
import ActiveCell from './activeCell';
import PickRow from './pickContainerRow';
import SetStatusCell from './setStatusCell';

import styles from './table.css';

const ActionCell = React.createClass({
  render() {
    const {item, attr} = this.props;
    const qrCodeLink = 'container/qrcode/' + item.ContainerNumber;
    return (
      <td style={{width: '40px', textAlign: 'center'}}>
      <a href={qrCodeLink} target='_blank'>
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
  handleFilter(attr) {
    const {pickStatus, category} = this.props;
    pickStatus(category[attr]);
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

    const {containerInfo, containers, isFetching, pagination} = this.props;
    const items = containers;

    const HeaderComponent = {
      BaseParent: BaseRow,
      BaseChild: BaseHeader,
      CustomChild: {},
      Columns: columns
    };

    const Header = <Collection item={header} components={HeaderComponent} />

    const SearchComponent = {
      BaseParent: BaseRow,
      BaseChild: BaseCellGray,
      CustomChild: {ContainerNumber: SearchCell, ContainerStatus: SetStatusCell},
      Columns: columns
    };

    const Search = <Collection item={{status: 'NotActive'}} components={SearchComponent} />

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

    const Info = _.map(containerInfo, (val, key) => {
      return <Infograph key={key} attr={key} val={val} onClick={this.handleFilter} />;
    });

    return (
      <div>
        {Info}
        <div style={{clear: 'both'}} />
        <Pagination {...pagination} setCurrentPage={this.setCurrentPage} setLimit={this.setLimit} />
        <table className={styles.table} style={isFetching ? {opacity: 0.5} : {}}>
          <thead>{Header}</thead>
          <tbody>
            <SearchCell />
            <td className={styles.td} />
            <SetStatusCell />
            <td className={styles.td} />
            <td className={styles.td} />
            <td className={styles.td} />
          </tbody>
          <tbody>{Body}</tbody>
        </table>
      </div>
    );
  }
});

const stateToProps = (state) => {
  const {containers, isFetching, shown, limit, currentPage, total, groups, statusCategory} = state.app.containers;
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
    containerInfo: groups,
    pagination: {
      limit: limit,
      currentPage: currentPage,
      totalItem: total
    },
    isFetching: isFetching,
    category: _.assign({}, statusCategory, {booked: [1]})
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
    pickStatus: function(val) {
      dispatch(StatusList.pick(val));
    },
  }
}

export default connect(stateToProps, dispatchToProps)(ContainerTable);
