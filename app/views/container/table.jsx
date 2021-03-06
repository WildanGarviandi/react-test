import React from 'react';
import {connect} from 'react-redux';
import {ButtonBase, DropdownTypeAhead, Input, Rows} from '../base';
import orderRemove from '../../modules/containers/actions/orderRemove';
import orderToggleAll from '../../modules/containers/actions/orderToggleAll';
import orderToggle from '../../modules/containers/actions/orderToggle';
import styles from './table.scss';
import classNaming from 'classnames';
import * as TripDetails from '../../modules/inboundTripDetails';
import { FormattedNumber } from 'react-intl';

export const BaseHeader = React.createClass({
  render() {
    let {attr, item} = this.props;
    return (<th className={styles.th}>{item[attr].toString()}</th>);
  }
});

export const BaseCell = React.createClass({
  render() {
    let {attr, item} = this.props;
    const name = (attr === 'isSuccess' && item[attr] === 'Yes') ? classNaming(styles.td, styles.tick) : classNaming(styles.td);
    let value; 
    switch(attr) {
      case 'isSuccess': value = ''; break;
      case 'CODValue': value = NumberCell(item[attr] || 0); break;
      default: value = item[attr] && item[attr].toString();
    }
    return (<td className={name}>{value}</td>);
  }
});

export const BaseCellInboundDetails = React.createClass({
  handleClick() {
    let {attr, item} = this.props;
    this.props.StartEditOrder(item.id3);
  },
  render() {
    let {attr, item} = this.props;
    const name = (attr === 'isSuccess' && item[attr] === 'Yes') ? classNaming(styles.td, styles.tick) : classNaming(styles.td);
    const value = (attr === 'isSuccess') ? '' : item[attr] && item[attr].toString();
    return (<td onClick={this.handleClick} className={name}>{value}</td>);
  }
});

const BaseCellInboundDetailsDispatch = (dispatch) => {
  return {
    StartEditOrder: function(orderID) {
      dispatch(TripDetails.StartEditOrder(orderID));
    }
  }
}

const BaseCellInboundDetailsContainer = connect(undefined, BaseCellInboundDetailsDispatch)(BaseCellInboundDetails);

export const BaseRow = React.createClass({
  render() {
    let {children} = this.props;
    return (<tr className={styles.tr}>{children}</tr>);
  }
});

export const BaseCellGray = React.createClass({
  render() {
    let {attr, item} = this.props;
    const name = classNaming(styles.td, {[styles.gray]: item.status == 'NotActive'});
    return (<td className={name}>{item[attr] && item[attr].toString()}</td>);
  }
});

export const SearchCell = React.createClass({
  render() {
    return (
      <td className={classNaming(styles.td, styles.search)}>
        <Input styles={{input: styles.searchInput}} base={{type:"text"}} />
      </td>
    );
  }
});

const NumberCell = (val) => {
  return (
    <FormattedNumber value={val} />
  );
};

const CellWithSelected = React.createClass({
  render() {
    const {item, val} = this.props;
    return (
      <td className={styles.td} style={{color: "#37B494", width: '90px'}}>
        <input type={'checkbox'} checked={item.checked} readOnly/>{val}
      </td>
    );
  }
});

const CellWithOnlySelect = React.createClass({
  handleClick() {
    const {item, toggleSelect} = this.props;
    toggleSelect(item.id2);
  },
  render() {
    const {item} = this.props;
    return (
      <td className={styles.td} style={{color: "#37B494", width: '10px'}}>
        <input type={'checkbox'} checked={item.checked} onClick={this.handleClick} readOnly/>
      </td>
    );
  }
});

const CellWithOnlySelectDispatch = (dispatch) => {
  return {
    toggleSelect: function(id) {
      dispatch(orderToggle(id));
    }
  }
}

const CellWithOnlySelectContainer = connect(undefined, CellWithOnlySelectDispatch)(CellWithOnlySelect);

const HeaderWithOnlySelect = React.createClass({
  handleClick() {
    const {item, orderToggleAll} = this.props;
    orderToggleAll(item.checked);
  },
  render() {
    const {item} = this.props;
    return (
      <th className={styles.th} style={{color: "#37B494", width: '10px'}}>
        <input type={'checkbox'} checked={item.checked} readOnly onClick={this.handleClick}/>
      </th>
    );
  }
});

const HeaderSelectDispatch = (dispatch) => {
  return {
    orderToggleAll: function(val) {
      dispatch(orderToggleAll(val));
    }
  }
}

const HeaderSelectContainer = connect(undefined, HeaderSelectDispatch)(HeaderWithOnlySelect);

const StatusCell = React.createClass({
  render() {
    const {val} = this.props;
    let cellStyle = {};

    if(val == 'Success') {
      cellStyle = { backgroundColor: 'green', color: 'white' };
    } else if(val == 'Failed') {
      cellStyle = { backgroundColor: 'red', color: 'white' };
    } if(val == 'Processing') {
      cellStyle = { backgroundColor: '#222D32', color: 'white' };
    }

    return (<td className={styles.td} style={cellStyle}>{val}</td>);
  }
});

const DeleteCell = React.createClass({
  handleDelete() {
    const {orderRemove, item, tripID} = this.props;
    orderRemove(item.tripID, item.id3);
  },
  render() {
    const {item} = this.props;
    const {isDeleting} = item;
    return (
      <td className={styles.td} style={{width: '60px', textAlign: 'center'}}>
        {
          isDeleting ? 
          <span>Deleting...</span> :
          <ButtonBase onClick={this.handleDelete}>Remove</ButtonBase>
        }
      </td>
    );
  }
});

const DeleteCellState = (state) => {
  return {};
}

const DeleteCellDispatch = (dispatch) => {
  return {
    orderRemove: function(tripID, orderID) {
      dispatch(TripDetails.OrderRemove(tripID, orderID));
    }
  }
}

const DeleteCellContainer = connect(DeleteCellState, DeleteCellDispatch)(DeleteCell);

const ContainerTable = React.createClass({
  render() {
    let {columns, headers, items, rowClicked} = this.props;
    let Header = Rows(React.DOM.thead, BaseHeader, {}, columns, function() {});
    let Body = Rows(React.DOM.tbody, BaseCellGray, {status: ActiveCellContainer}, columns, rowClicked, styles.tr);
    let Search = Rows(React.DOM.tbody, SearchCell, {}, columns, function() {});

    return (
      <table className={styles.table}>
        <Header items={headers} />
        <Search items={headers} />
        <Body items={items} />
      </table>
    );
  }
});

const OrderStatusSelect = React.createClass({
  selectVal(val) {
    this.props.pickStatus(val);
  },
  render() {
    const {statusList, statusName} = this.props;
    return (
      <td className={classNaming(styles.td, styles.search)} style={{width: 150}}>
        <DropdownTypeAhead options={statusList} selectVal={this.selectVal} val={statusName} />
      </td>
    );
  }
});

export const OrderTable = React.createClass({
  getInitialState() {
    return {orderStatus: "SHOW ALL", routeStatus: "SHOW ALL"};
  },
  pickStatus(key, val) {
    this.setState({[key]: val.value});
  },
  render() {
    let {columns, headers, items, statusList, isInbound} = this.props;
    let {orderStatus, routeStatus} = this.state;
    let Header = Rows(React.DOM.thead, BaseHeader, {}, columns, function() {});
    let Body = Rows(React.DOM.tbody, isInbound ? BaseCellInboundDetailsContainer : BaseCell, {action: DeleteCellContainer}, columns, function() {}, undefined, 
      {
        column: 'isSuccess',
        condition: 'Yes',
        className: styles.lightGreen
      });

    const filteredItems = _.filter(items, (item) => {
      const matchOrderStatus = orderStatus === "SHOW ALL" || orderStatus === item.orderStatus;
      const matchRouteStatus = routeStatus === "SHOW ALL" || routeStatus === item.routeStatus;

      return matchOrderStatus && matchRouteStatus;
    });

    const SearchRow = _.map(columns, (column) => {
      if(column === "orderStatus") {
        return <OrderStatusSelect key={column} statusList={statusList} statusName={this.state.orderStatus} pickStatus={this.pickStatus.bind(null, column)} />;
      }

      if(column === "routeStatus") {
        return <OrderStatusSelect key={column} statusList={statusList} statusName={this.state.routeStatus} pickStatus={this.pickStatus.bind(null, column)} />;
      }

      return <td key={column} className={styles.td} />;
    });

    return (
      <table className={styles.table}>
        <Header items={headers} />
        <tbody><tr>{SearchRow}</tr></tbody>
        <Body items={filteredItems} />
      </table>
    );
  }
});

export const OrderTable2 = React.createClass({
  render() {
    let {columns, headers, items, rowClicked} = this.props;
    let Header = Rows(React.DOM.thead, BaseHeader, {check: HeaderSelectContainer}, columns, function() {});
    let Body = Rows(React.DOM.tbody, BaseCell, {check: CellWithOnlySelectContainer, status: StatusCell}, columns, rowClicked);

    return (
      <table className={styles.table}>
        <Header items={headers} />
        <Body items={items} />
      </table>
    );
  }
});

export default ContainerTable;
