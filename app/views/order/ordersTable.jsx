import React from 'react';
import styles from './table.scss';
import styles2 from './styles.scss';
import {ButtonWithLoading, ButtonStandard, Input, Pagination, DropdownWithState} from '../base';
import classNaming from 'classnames';

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
  onClick() {
    this.props.FindID(this.state.id);
  },
  componentDidMount() {
    this.props.GetList();
  },
  render() {
    const {Headers, Filters, Body, PaginationActions, isFetching, isFill, isPickup, items, pagination} = this.props;
    const style = isFetching ? {opacity: 0.5} : {};

    let btnText = "Group Orders";
    let btnLoadingText = "Grouping Orders";

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
        base: styles2.groupBtn + " " + (this.props.isGrouping ? styles2.greenBtnLoading : styles2.greenBtn) + 
              " " + styles2.pickupActionBtn
      }
    }

    const markPickupBtnProps = {
      textBase: 'Mark available for pickup',
      textLoading: 'Marking Orders',
      isLoading: this.props.isMarkingPickup,
      onClick: this.props.MarkPickup,
      styles: {
        base: styles2.groupBtn + " " + (this.props.isMarkingPickup ? styles2.greenBtnLoading : styles2.greenBtn) +
              " " + styles2.pickupActionBtn
      }
    }

    var orderWrapClasses = classNaming(
      styles2.finderWrapper,
      {'pull-right': true}
    );

    var orderLblClasses = classNaming(
      styles2.finderLabel,
      {'col-xs-6': true}
    );

    var consoleBtnClasses = classNaming(
      this.props.className,
      {'col-xs-6': true}
    );

    let bodyComponents = (
      <td colSpan={8}>
        <div style={{fontSize: 20, textAlign:'center'}}>
          Fetching data...
        </div>
      </td>
    );
    if (!isFetching) {
      if (items.length === 0) {
        bodyComponents = (
          <td colSpan={8}>
            <div style={{textAlign:'center'}}>
              <img src="/img/orders-empty-state.png" />
              {
                isPickup &&
                <div style={{fontSize: 20}}>
                  You have no pickup order
                </div>
              }
              {
                !isPickup &&
                <div style={{fontSize: 20}}>
                  You have no received orders
                </div>
              }
            </div>
          </td>
        );
      } else {
        bodyComponents = (
          <Body items={items} />
        )
      }
    }

    return (
      <div style={style}>
        <Pagination {...pagination} {...PaginationActions} />
        <ButtonWithLoading {...groupingOrdersBtnProps} />
        {
          isPickup &&
          <ButtonWithLoading {...markPickupBtnProps} />
        }
        {
          !isPickup && !isFill &&
          <span className={styles2.finderWrapper}>
            <span className={styles2.finderLabel}>
              Jump to Order with AWB :
            </span>
            <Input onChange={this.onChange} onEnterKeyPressed={this.onEnterKeyPressed} base={{placeholder: "Insert AWB Here"}} />
            <a onClick={this.onClick} className={styles2.submitButton}>Submit</a>
          </span>
        }
        <table className={styles.table}>
          <Headers />
          {bodyComponents}
        </table>
        <Pagination {...pagination} {...PaginationActions} />
      </div>
    );
  }
});

export default Table;
