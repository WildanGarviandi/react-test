import React from 'react';
import styles from './table.css';
import styles2 from './styles.css';
import {ButtonWithLoading, Input, Pagination} from '../base';

const Table = React.createClass({
  getInitialState() {
    return {id: ''};
  },
  onChange(text) {
    this.setState({id: text});
  },
  onEnterKeyPressed(text) {
    this.props.FindID(text);
  },
  componentDidMount() {
    this.props.GetList();
  },
  render() {
    const {Headers, Filters, Body, PaginationActions, isFetching, isFill, isPickup, items, pagination} = this.props;
    const style = isFetching ? {opacity: 0.5} : {};

    let btnText = isPickup ? "Group Orders" : "Consolidate Orders";
    let btnLoadingText = isPickup ? "Grouping Orders" : "Consolidating Orders";

    if(isFill) {
      btnText = "Add Orders";
      btnLoadingText = "Adding Orders";
    }

    const groupingOrdersBtnProps = {
      textBase: btnText,
      textLoading: btnLoadingText,
      isLoading: this.props.isGrouping,
      onClick: this.props.GroupOrders,
      styles: {
        base: styles2.groupBtn + " " + (this.props.isGrouping ? styles2.greenBtnLoading : styles2.greenBtn),
      }
    }

    return (
      <div style={style}>
        <Pagination {...pagination} {...PaginationActions} />
        <ButtonWithLoading {...groupingOrdersBtnProps} />
        {
          !isPickup && !isFill &&
          <span className={styles2.finderWrapper}>
            <span className={styles2.finderLabel}>
              Jump to Order with AWB :
            </span>
            <Input onChange={this.onChange} onEnterKeyPressed={this.onEnterKeyPressed} base={{placeholder: "Insert AWB Here"}} />
          </span>
        }
        <table className={styles.table}>
          <Headers />
          <Filters /> 
          <Body items={items} />
        </table>
        <Pagination {...pagination} {...PaginationActions} />
      </div>
    );
  }
});

export default Table;
