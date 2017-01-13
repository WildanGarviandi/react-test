import React from 'react';
import {connect} from 'react-redux';
import {ButtonBase, DropdownTypeAhead, Input, Rows} from '../views/base';
import {orderRemove, orderToggleAll, orderToggle} from './tripDetailsAction';
import tableStyles from '../views/base/table.css';
import styles from './styles.css';
import classNaming from 'classnames';
import * as TripDetails from './tripDetailsService';
import { FormattedNumber } from 'react-intl';

export const BaseHeader = React.createClass({
  render() {
    let {attr, item} = this.props;
    return (<th className={styles.thHeader}>{item[attr].toString()}</th>);
  }
});

export const BaseCell = React.createClass({
  render() {
    let {attr, item} = this.props;
    const name = (attr === 'isSuccess' && item[attr] === 'Yes') ? classNaming(tableStyles.td, styles.tick) : classNaming(tableStyles.td);
    let value; 
    switch(attr) {
      case 'isSuccess': value = ''; break;
      case 'CODValue': value = NumberCell(item[attr] || 0); break;
      case 'orderStatus': value = <p className={styles.tableStatus}>{item[attr]}</p>; break;
      case 'routeStatus': value = <p className={styles.tableStatus}>{item[attr]}</p>; break;
      default: value = item[attr] && item[attr].toString();
    }
    return (<td className={name}><a href={'/orders/'+item.id3} target="_blank">{value}</a></td>);
  }
});

export const BaseCellInboundDetails = React.createClass({
  handleClick() {
    let {attr, item} = this.props;
    this.props.StartEditOrder(item.id3);
  },
  render() {
    let {attr, item} = this.props;
    const name = (attr === 'isSuccess' && item[attr] === 'Yes') ? classNaming(tableStyles.td, styles.tick) : classNaming(tableStyles.td);
    let value; 
    switch(attr) {
      case 'isSuccess': value = ''; break;
      case 'CODValue': value = NumberCell(item[attr] || 0); break;
      case 'orderStatus': value = <p className={styles.tableStatus}>{item[attr]}</p>; break;
      case 'routeStatus': value = <p className={styles.tableStatus}>{item[attr]}</p>; break;
      default: value = item[attr] && item[attr].toString();
    }
    return (<td className={name}><a href={'/orders/'+item.id3} target="_blank">{value}</a></td>);
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
    return (<tr className={tableStyles.tr}>{children}</tr>);
  }
});

export const BaseCellGray = React.createClass({
  render() {
    let {attr, item} = this.props;
    const name = classNaming(tableStyles.td, {[tableStyles.gray]: item.status == 'NotActive'});
    return (<td className={name}>{item[attr] && item[attr].toString()}</td>);
  }
});

export const SearchCell = React.createClass({
  render() {
    return (
      <td className={classNaming(tableStyles.td, tableStyles.search)}>
        <Input styles={{input: tableStyles.searchInput}} base={{type:"text"}} />
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
      <td className={tableStyles.td} style={{color: "#37B494", width: '90px'}}>
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
      <td className={tableStyles.td} style={{color: "#37B494", width: '10px'}}>
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
      <th className={tableStyles.th} style={{color: "#37B494", width: '10px'}}>
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

    return (<td className={tableStyles.td} style={cellStyle}>{val}</td>);
  }
});

const DeleteCell = React.createClass({
  handleDelete() {
    const {orderRemove, item, tripID} = this.props;
    orderRemove(item.tripID, item.id3);
  },
  render() {
    const {item} = this.props;
    const {isSuccess, isDeleting} = item;

    return (
      <td className={tableStyles.td} style={{width: '60px', textAlign: 'center'}}>
        {
          isSuccess === 'Yes' && 
          <span></span>
        }
        {
          isDeleting &&
          <span>Deleting ...</span>
        }
        {
          !isDeleting && isSuccess === 'No' &&
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
    let Body = Rows(React.DOM.tbody, BaseCellGray, {status: ActiveCellContainer}, columns, rowClicked, tableStyles.tr);
    let Search = Rows(React.DOM.tbody, SearchCell, {}, columns, function() {});

    return (
      <table className={tableStyles.table}>
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
      <DropdownTypeAhead options={statusList} selectVal={this.selectVal} val={statusName} />
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
        className: tableStyles.lightGreen
      });

    const filteredItems = _.filter(items, (item) => {
      const matchOrderStatus = orderStatus === "SHOW ALL" || orderStatus === item.orderStatus;
      const matchRouteStatus = routeStatus === "SHOW ALL" || routeStatus === item.routeStatus;

      return matchOrderStatus && matchRouteStatus;
    });

    const SearchRow = _.map(columns, (column, idx) => {
      if(column === "orderStatus") {
        return (
          <div key={idx} className={styles.colMd3 + ' ' + styles.filterDropDown}>
            <span>Order Status</span>
            <OrderStatusSelect key={column} statusList={statusList} statusName={this.state.orderStatus} pickStatus={this.pickStatus.bind(null, column)} />
          </div>
        );
      }

      if(column === "routeStatus") {
        return (
          <div key={idx} className={styles.colMd3 + ' ' + styles.filterDropDown}>
            <span>Route Status</span>
            <OrderStatusSelect key={column} statusList={statusList} statusName={this.state.routeStatus} pickStatus={this.pickStatus.bind(null, column)} />
          </div>
        );
      };
    });

    return (
      <div>
        <div className="nb">
          <div className="row">
            {SearchRow}
          </div>
        </div>
        <table className={tableStyles.table}>
          <Header items={headers} />
          <Body items={filteredItems} />
        </table>
      </div>
    );
  }
});

export const OrderTable2 = React.createClass({
  render() {
    let {columns, headers, items, rowClicked} = this.props;
    let Header = Rows(React.DOM.thead, BaseHeader, {check: HeaderSelectContainer}, columns, function() {});
    let Body = Rows(React.DOM.tbody, BaseCell, {check: CellWithOnlySelectContainer, status: StatusCell}, columns, rowClicked);

    return (
      <table className={tableStyles.table}>
        <Header items={headers} />
        <Body items={items} />
      </table>
    );
  }
});

export default ContainerTable;
