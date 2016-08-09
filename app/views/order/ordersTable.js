import React from 'react';
import styles from './table.css';
import {Pagination} from '../base';

const Table = React.createClass({
  componentDidMount() {
    this.props.GetList();
  },
  render() {
    const {Headers, Filters, Body, PaginationActions, isFetching, items, pagination} = this.props;
    const style = isFetching ? {opacity: 0.5} : {};

    return (
      <div style={style}>
        <Pagination {...pagination} {...PaginationActions} />
        <table className={styles.table}>
          <Headers />
          <Filters /> 
          <Body items={items} />
        </table>
      </div>
    );
  }
});

export default Table;
