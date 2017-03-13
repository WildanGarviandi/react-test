import lodash from 'lodash';
import React from 'react';
import DateTime from 'react-datetime';
import {connect} from 'react-redux';
import moment from 'moment';
import * as Table from '../components/table';
import styles from './table.css';
import * as OrderService from './orderService';
import OrderStatusSelector from '../modules/orderStatus/selector';
import {Glyph} from '../views/base';
import {formatDate} from '../helper/time';
import {ButtonBase} from '../views/base';
import {CheckboxHeader2 as CheckboxHeaderBase, CheckboxCell} from '../views/base/tableCell';
import {FilterTop, FilterTop2, FilterText} from '../components/form';
import NumberFormat from 'react-number-format';
import stylesButton from '../components/button.css';
import {ButtonWithLoading} from '../components/button';
import ReactTooltip from 'react-tooltip';
import config from '../config/configValues.json';
import Countdown from 'react-cntdwn';

function StoreBuilder(keyword) {
  return (store) => {
    const {filters} = store.app.myOrders;

    return {
      value: filters[keyword],
    }
  }    
}

function DispatchBuilder(keyword) {
  return (dispatch) => {
    function OnChange(e) {
      const newFilters = {[keyword]: e.target.value};
      dispatch(OrderService.UpdateFilters(newFilters));
    }

    function OnKeyDown(e) {
      if(e.keyCode !== 13) {
        return;
      }

      dispatch(OrderService.StoreSetter("currentPage", 1));
      dispatch(OrderService.FetchList());
    }

    return {
      onChange: OnChange, 
      onKeyDown: OnKeyDown,
    }
  }
}

function DispatchDateTime(dispatch) {
  return {
    onChange: function(date) {
      dispatch(OrderService.SetCreatedDate(date));
    }
  }
}

function DropdownStoreBuilder(name) {
  return (store) => {
    
    const sortOptions = [{
      key: 1, value: 'Deadline (newest)', 
    }, {
      key: 2, value: 'Deadline (oldest)',
    }];

    const options = {
      "statusName": OrderStatusSelector.GetList(store),
      "sortOptions": sortOptions
    }


    return {
      value: store.app.myOrders[name],
      options: options[name]
    }
  }
}

function DropdownDispatchBuilder(filterKeyword) {
  return (dispatch) => {
    return {
      handleSelect: (selectedOption) => {
        const SetFn = OrderService.SetDropDownFilter(filterKeyword);
        dispatch(SetFn(selectedOption));
      }
    }
  }
}

function CheckboxDispatch(dispatch, props) {
  return {
    onToggle: () => {
      dispatch(OrderService.ToggleChecked(props.orderID));
    }
  }
}
 
function CheckboxHeaderStore(store) {
  return {
    isChecked: store.app.myOrders.selectedAll,
  }
}
 
function CheckboxHeaderDispatch(dispatch) {
  return {
    onToggle: () => {
      dispatch(OrderService.ToggleCheckedAll());
    }
  }
}

function DateRangeBuilder(keyword) {
  return (store) => {
    const {filters} = store.app.myOrders;
    return {
      startDate: filters['start' + keyword],
      endDate: filters['end' + keyword],
    }
  }
}
 
function DateRangeDispatch(keyword) {
  return (dispatch) => {
    return {
      onChange: (event, picker) => {
        const newFilters = {
          ['start' + keyword]: picker.startDate.toISOString(),
          ['end' + keyword]: picker.endDate.toISOString()
        }
        dispatch(OrderService.UpdateAndFetch(newFilters))
      }
    }
  }
}

function ConnectBuilder(keyword) {
  return connect(StoreBuilder(keyword), DispatchBuilder(keyword));
}

function ConnectDropdownBuilder(keyword) {
  return connect(DropdownStoreBuilder(keyword), DropdownDispatchBuilder(keyword));
}

const CheckboxHeader = connect(CheckboxHeaderStore, CheckboxHeaderDispatch)(CheckboxHeaderBase);
const CheckboxRow = connect(undefined, CheckboxDispatch)(CheckboxCell);
const ContainerNumberFilter = ConnectBuilder('containerNumber')(Table.InputCell);
const StatusFilter = ConnectDropdownBuilder('statusName')(FilterTop);
const SortFilter = ConnectDropdownBuilder('sortOptions')(FilterTop);
const MerchantFilter = ConnectBuilder('merchant')(Table.InputCell);
const PickupFilter = ConnectBuilder('pickup')(Table.InputCell);
const DropoffFilter = ConnectBuilder('dropoff')(Table.InputCell);
const DriverFilter = ConnectBuilder('driver')(Table.InputCell);
const PickupDateFilter = connect(DateRangeBuilder('Pickup'), DateRangeDispatch('Pickup'))(Table.FilterDateTimeRangeCell);

export const Filter = React.createClass({
  render() {
    const reassignTripButton = {
      textBase: 'Assign Orders',
      onClick: this.props.expandDriver,
      styles: {
        base: stylesButton.greenButton3,
      }
    };
    return (
      <div>
        <CheckboxHeader />
        <SortFilter />
        {
          /*<div className={styles.reassignBulkButton}>
              <ButtonWithLoading {...reassignTripButton} />
          </div>*/
        }
      </div>
    );
  }
})

function OrderHeader() {
  return (
    <tr>
      <CheckboxHeader />
      <Table.TextHeader text="Trip Number" />
      <Table.TextHeader text="Status" />
      <Table.TextHeader text="Webstore" />
      <Table.TextHeader text="Pickup" />
      <Table.TextHeader text="Dropoff" />
      <Table.TextHeader text="Pickup Time" />
      <Table.TextHeader text="Driver" />
      <Table.TextHeader text="Number of Orders" style={{whiteSpace:'nowrap'}} />
    </tr>
  );
}

function OrderParser(order) {
  return lodash.assign({}, order, {
    IsOrder: true
  })
}

function OrderFilter() {
  return (
    <tr className={styles.tr}>
      <Table.EmptyCell />
      <ContainerNumberFilter />
      <StatusFilter />
      <MerchantFilter />
      <PickupFilter />
      <DropoffFilter />
      <PickupDateFilter />
      <DriverFilter />
      <OrderFilter />
    </tr>
  )
}

export const Deadline = React.createClass({
  render() {
    let format = {
      hour: 'hh',
      minute: 'mm',
      second: 'ss'
    };
    let Duration = moment.duration(moment(this.props.deadline).diff(moment(new Date())));
    if (!this.props.deadline) {            
      return <span style={{color: 'black'}}>
          -
      </span>
    } else if (Duration._milliseconds > config.deadline.day) {            
      return <span style={{color: 'black'}}>
          {Duration.humanize()} remaining
      </span>
    } else if (Duration._milliseconds < 0) {
      return <span style={{color: 'red'}}>
          Passed
      </span>
    } else {
      let normalDeadline = (Duration._milliseconds > config.deadline['3hours']) && (Duration._milliseconds < config.deadline.day);
      return <span style={{color: normalDeadline ? 'black' : 'red'}}>
        <Countdown targetDate={new Date(this.props.deadline)}
         startDelay={500}
         interval={1000}
         format={format}
         timeSeparator={':'}
         leadingZero={true} />
      </span>
    }
  }
});

const OrderRow = React.createClass({
  getInitialState() {
    return ({isHover: false, isEdit: false});
  },
  expandOrder(order) {
    this.props.shrink();
    setTimeout(function() {
      if (!this.props.expandedOrder.UserOrderID) {
        this.props.expand(order);
      } else {
        if (this.props.expandedOrder.UserOrderID !== order.UserOrderID) {
          this.props.expand(order);
        } else {
          this.props.shrink();
        }
      }
    }.bind(this), 100);
  },
  onMouseOver() {
    this.setState({isHover: true});
  },
  onMouseOut() {
    this.setState({isHover: false});
  },
  render() {
    const { order, expandedOrder } = this.props;
    const { isEdit, isHover } = this.state;
    const parsedOrder = OrderParser(order);
    let rowStyles = styles.tr + ' ' + styles.card  + (this.state.isHover && (' ' + styles.hovered));
    if (expandedOrder.UserOrderID === order.UserOrderID) {
      rowStyles = styles.tr + ' ' + styles.card +  ' ' + styles.select;
    }
    return (
      <tr className={rowStyles} 
        onMouseEnter={this.onMouseOver} onMouseLeave={this.onMouseOut}>
        <td><CheckboxRow isChecked={order.IsChecked} orderID={order.UserOrderID} /></td>
        <td onClick={()=>{this.expandOrder(order)}}><div className={styles.cardSeparator} /></td>
        <td onClick={()=>{this.expandOrder(order)}} className={styles.tripIDColumn}>{`ORDER- ${order.UserOrderID}`}</td>
        <td onClick={()=>{this.expandOrder(order)}}><div className={styles.cardSeparator} /></td>
        <td onClick={()=>{this.expandOrder(order)}}>
          <div className={styles.cardLabel}>
            Weight
          </div>
          <br />
          <div className={styles.cardValue}>
            {order.PackageWeight}
          </div>
        </td>
        <td onClick={()=>{this.expandOrder(order)}}><div className={styles.cardSeparator} /></td>
        <td onClick={()=>{this.expandOrder(order)}}>
          <div className={styles.cardLabel}>
            Deadline
          </div>
          <br />
          <div className={styles.cardValue}>
            <Deadline deadline={order.DueTime} />
          </div>
        </td>
      </tr>
    );
  }
});

const OrderBody = React.createClass({
  getBodyContent() {
    const { orders, expandedOrder, expand, shrink } = this.props;
    let content = [];
    orders.forEach((order) => {
      content.push(<OrderRow key={order.UserOrderID} order={OrderParser(order)} expandedOrder={expandedOrder} expand={expand} shrink={shrink} />);
    });
    return content;
  },
  render() {
    return (
      <tbody>
        {this.getBodyContent()}
      </tbody>
    );
  }
});

function OrderBodyStore() {
  return (store) => {
    const { expandedOrder } = store.app.myOrders;
    return {
      expandedOrder: expandedOrder
    }
  }
}

function OrderBodyDispatch() {
  return (dispatch) => {
    return {
      expand: (order) => {
        dispatch(OrderService.ExpandOrder(order));
      },
      shrink: () => {
        dispatch(OrderService.ShrinkOrder());
      }
    }
  }
}

const OrderBodyContainer = connect(OrderBodyStore, OrderBodyDispatch)(OrderBody);

function OrderTable({orders}) {
  const headers = <OrderHeader />;

  return (
    <table className={styles.table}>
      <OrderBodyContainer orders={orders} />
    </table>
  );
}

export default OrderTable;