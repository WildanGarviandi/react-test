import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';
import * as utils from './utils';
import {InputText} from './input';

import styles from './table.css';

const classnaming = require('classnames/bind').bind(styles);

function Tables(columns, customCell = {}, opts = {}) {
  const HeaderCell = ({val}) => {
    return (
      <th className={styles.th}>{val.toString()}</th>
    );
  }

  const HeaderRow = ({header}) => {
    let cells = _.map(columns, (column) => {
      return <HeaderCell key={column} val={utils.ObjectFieldValue(header, column)} />
    });

    return(
      <tr>{cells}</tr>
    );
  }

  const BodyCell = ({val}) => {
    return (<td className={styles.td}>{ val ? val.toString() : ''}</td>);
  }

  const BodyRow = React.createClass({
    toggleChecked() {
      // this.setState({checked: !this.state.checked});

      let {idx, setSelectedIdx, rowClicked} = this.props;
      if(setSelectedIdx) {
        setSelectedIdx(idx);
        rowClicked(this.props.datum);
      }
    },
    render() {
      let {active, datum} = this.props;
      let cells = _.map(columns, (column) => {
      if(column in customCell) {
          let Comps = customCell[column].comps;
          return <Comps className={styles.td} key={column} val={utils.ObjectFieldValue(datum, column)} active={active} checked={datum.checked} yeah={datum} />
        } else {
          return <BodyCell key={column} val={utils.ObjectFieldValue(datum, column)} />
        }
      });

      return (
        <tr className={styles.tr} onClick={this.toggleChecked}>{cells}</tr>
      );
    }
  });

  const SearchRow = ({}) => {
    let cells = _.map(columns, (column) => {
      return <td key={column} className={classnaming('td', 'search')}><InputText className={styles.searchInput} /></td>
    });

    return (
      <tr>{cells}</tr>
    );
  }

  const Body = React.createClass({
    getInitialState() {
      return {selectedIdx: -1}
    },
    setSelectedIdx(x) {
      this.setState({selectedIdx: x});
    },
    render() {
      let {data, rowClicked} = this.props;
      let rows = _.map(data, (datum, idx) => {
        return <BodyRow key={idx} active={idx == this.state.selectedIdx} idx={idx} datum={datum} setSelectedIdx={this.setSelectedIdx} rowClicked={rowClicked} />
      });

      let searchRows = <SearchRow />
      if(opts.withoutSearch) {
        return (<tbody>{rows}</tbody>);
      }

      return (
        <tbody>
          {searchRows}
          {rows}
        </tbody>
      );
    }
  });

  const Table = React.createClass({
    render() {
      let {header} = this.props;

      return (
        <table className={styles.table}>
          <thead>
            <HeaderRow header={header} />
          </thead>
          <Body {...this.props} />
        </table>
      );
    }
  });

  return Table;
}

function Rows(BaseComponent, BaseCell, CustomCell, columns, actionFn, rowClassName) {
  const RowItem = React.createClass({
    handleAction(column) {
      let {item} = this.props;      
      actionFn(item, column);
    },
    render() {
      let {item} = this.props;
      let cols = _.map(columns, (column) => {
        let Cell = (column in CustomCell) ? CustomCell[column] : BaseCell;
        return <Cell key={column} val={item[column]} item={item} attr={column} action={this.handleAction} />
      });

      return (<tr className={styles.tr + ' ' + rowClassName}>{cols}</tr>);
    }
  });

  const Row = React.createClass({
    render() {
      let {items} = this.props;
      let rows = _.map(items, (item, idx) => {
        return(<RowItem key={idx} item={item}/>)
      });

      return (
        <thead>{rows}</thead>
      );
    }
  });

  return Row;
}

export { Tables, Rows };
