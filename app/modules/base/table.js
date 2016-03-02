import React from 'react';
import _ from 'underscore';
import * as utils from './utils';
import {Glyph} from './glyph';
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
    getInitialState() {
      return {checked: false}
    },
    toggleChecked() {
      this.setState({checked: !this.state.checked});

      let {idx, setSelectedIdx} = this.props;
      if(setSelectedIdx) {
        setSelectedIdx(idx);
      }
    },
    render() {
      let {active, datum} = this.props;
      let cells = _.map(columns, (column) => {
      if(column in customCell) {
          let Comps = customCell[column].comps;
          return <Comps className={styles.td} key={column} val={utils.ObjectFieldValue(datum, column)} active={active} checked={this.state.checked} />
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
      let {data} = this.props;
      let rows = _.map(data, (datum, idx) => {
        return <BodyRow key={idx} active={idx == this.state.selectedIdx} idx={idx} datum={datum} setSelectedIdx={this.setSelectedIdx} />
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
      let {data, header} = this.props;

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

export { Tables };
