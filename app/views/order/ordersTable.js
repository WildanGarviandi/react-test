import React from 'react';
import styles from './table.css';

const Table = React.createClass({
  componentDidMount() {
    this.props.GetList();
  },
  render() {
    const {Headers, Filters, Body, items} = this.props;
    return (
      <table className={styles.table}>
        <Headers />
        <Filters /> 
        <Body items={items} />
      </table>
    );
  }
});

export default Table;
