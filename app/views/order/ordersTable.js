import React from 'react';
import styles from './table.css';
import styles2 from './styles.css';
import {ButtonWithLoading, Input, Pagination} from '../base';
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
    const {Headers, Filters, Body, PaginationActions, isFetching, isFill, isPickup, isInbound, items, pagination} = this.props;
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
          <td colSpan={12}>
            <div className={styles.emptyTableContainer}>
              {
                isPickup &&
                <span>
                  <div style={{fontSize: 20}}>
                    You have no pickup order
                  </div>
                </span>
              }
              {
                !isPickup && !isInbound &&
                <span>
                  <img src="/img/orders-empty-state.png" />
                  <div style={{fontSize: 20}}>
                    You have no received orders
                  </div>
                </span>
              }
              {
                !isPickup && isInbound &&
                <span>
                  <img src="/img/orders-empty-state.png" />
                  <div style={{fontSize: 20, fontWeight: 'bold'}}>
                    Awesome work guys!
                  </div>
                  <div style={{fontSize: 12, color: '#9C9C9C', marginTop: 12}}>
                    All trip orders are verified, you have scanned and verified all the inbound orders.
                  </div>
                </span>
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
        {
          !isInbound &&
          <ButtonWithLoading {...groupingOrdersBtnProps} />
        }
        {
          isPickup &&
          <ButtonWithLoading {...markPickupBtnProps} />
        }
        {
          !isPickup && !isFill && !isInbound &&
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
