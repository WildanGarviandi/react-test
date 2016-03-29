import React from 'react';
import {connect} from 'react-redux';
import {ButtonBase, InputText, Rows} from '../base';
import orderRemove from '../../modules/containers/actions/orderRemove';
import containerActiveToggle from '../../modules/containers/actions/containerActiveToggle';
import styles from './table.css';

const classnaming = require('classnames/bind').bind(styles);

const BaseHeader = React.createClass({
  render() {
    let {val} = this.props;
    return (<th className={styles.th}>{val}</th>);
  }
});

const BaseCell = React.createClass({
  handleAction() {
    let {action, column} = this.props;
    action(column);
  },
  render() {
    let {val} = this.props;
    return (<td className={styles.td} onClick={this.handleAction}>{val}</td>);
  }
});

const BaseCellGray = React.createClass({
  handleAction() {
    let {action, column} = this.props;
    action(column);
  },
  render() {
    let {item, val} = this.props;
    const name = classnaming('td', {'gray': item.status == 'NotActive'});
    return (<td className={name} onClick={this.handleAction}>{val}</td>);
  }
});

const SearchCell = React.createClass({
  render() {
    return (
      <td className={classnaming('td', 'search')}>
        <InputText className={styles.searchInput} />
      </td>
    );
  }
});

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
    const {orderRemove, item} = this.props;
    orderRemove(item.id3);
  },
  render() {
    const {item} = this.props;
    const {isDeleting} = item;
    return (
      <td className={styles.td} style={{width: '60px', textAlign: 'center'}}>
        {
          isDeleting ? 
          <span>Deleting...</span> :
          <ButtonBase onClick={this.handleDelete}>Delete</ButtonBase>
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
    orderRemove: function(id) {
      dispatch(orderRemove(id));
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

const ActiveCell = React.createClass({
  handleToggle() {
    const {item, containerActiveToggle} = this.props;
    containerActiveToggle(item.id);
  },
  render() {
    const {item, val} = this.props;
    const name = classnaming('checkbox', val);
    const tdName = classnaming('td', {'gray': item.status == 'NotActive'});

    return (<td className={tdName} style={{width: '40px', textAlign: 'center'}}><span className={name} onClick={this.handleToggle} /></td>);
  }
});

const ActiveCellState = (state) => {
  return {};
}

const ActiveCellDispatch = (dispatch) => {
  return {
    containerActiveToggle: function(id) {
      dispatch(containerActiveToggle(id));
    }
  }
}

const ActiveCellContainer = connect(ActiveCellState, ActiveCellDispatch)(ActiveCell);

export const OrderTable = React.createClass({
  render() {
    let {columns, headers, items} = this.props;
    let Header = Rows(React.DOM.thead, BaseHeader, {}, columns, function() {});
    let Body = Rows(React.DOM.tbody, BaseCell, {action: DeleteCellContainer}, columns, function() {});

    return (
      <table className={styles.table}>
        <Header items={headers} />
        <Body items={items} />
      </table>
    );
  }
});

export const OrderTable2 = React.createClass({
  render() {
    let {columns, headers, items, rowClicked} = this.props;
    let Header = Rows(React.DOM.thead, BaseHeader, {}, columns, function() {});
    let Body = Rows(React.DOM.tbody, BaseCell, {id: CellWithSelected, status: StatusCell}, columns, rowClicked);

    return (
      <table className={styles.table}>
        <Header items={headers} />
        <Body items={items} />
      </table>
    );
  }
});

export default ContainerTable;
