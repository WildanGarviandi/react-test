import lodash from 'lodash';
import React from 'react';
import {push} from 'react-router-redux';
import {connect} from 'react-redux';
import {Body} from '../views/base/table';
import {conf, updateOrdersColumns} from '../views/order/ordersColumns';
import BodyRow, {CheckBoxCell, LinkCell, TextCell, OrderIDLinkCell} from '../views/base/cells';
import * as UpdateOrders from './updateOrdersService';
import {formatDate, formatDateHourOnly} from '../helper/time';
import {CheckboxCell} from '../views/base/tableCell';
import styles from '../views/base/table.css';
import moment from 'moment';

function mapDispatchToCheckBox(dispatch, ownProps) {
  return {
    onToggle: function(val) {
      dispatch(UpdateOrders.ToggleSelectOne(ownProps.item.UserOrderID));
    }
  }
}

const UpdateOrdersCheckBox = connect(undefined, mapDispatchToCheckBox)(CheckboxCell);

function mapDispatchToLink(dispatch, ownParams) {
  return {
    onClick: function() {
      dispatch(push('/orders/' + ownParams.item.UserOrderID));
    }
  }
}

const UpdateOrdersLink = connect(undefined, mapDispatchToLink)(OrderIDLinkCell);

const Interval = React.createClass({
  getInitialState() {
    return {
      time: this.props.startTime
    }
  },
  tickDown() {
    this.setState({
      time: this.state.time - 1000
    });
  },
  tickUp() {
    this.setState({
      time: this.state.time + 1000
    });
  },
  componentDidMount() {
    this.interval = setInterval(() => {
      if (this.props.down) {
        this.tickDown();
      } else {
        this.tickUp();
      }
    }, 1000);
  },
  componentWillUnmount() {
    clearInterval(this.interval);
  },
  render() {
    return (
      <span>{formatDateHourOnly(this.state.time)}</span>
    )
  }
});

const UpdateRowClass = React.createClass({
  startEditOrder(val) {
    this.props.startEditOrder(this.props.item);
  },
  render() {
    const {idx, cells} = this.props;
    return (
      <tr className={styles.tr} onClick={this.startEditOrder}>{cells}</tr>
    );
  }
});

function mapDispatchToUpdateRow(dispatch, ownParams) {
  return {
    startEditOrder: (order) => {
      dispatch(UpdateOrders.StartEditOrder(order.UserOrderID));
    }
  }
}

const UpdateRow = connect(undefined, mapDispatchToUpdateRow)(UpdateRowClass);

function BodyComponent(type, keyword, item, index) {
  switch(type) {
    case "String": {
      if (["PackageLength", "PackageWidth", "PackageHeight"].indexOf(keyword) != -1) {
        return <TextCell text={item[keyword] + ' cm'} />
      } else if ("PackageWeight" === keyword) {
        return <TextCell text={item[keyword] + ' kg'} />
      } else {
        return <TextCell text={item[keyword]} />
      }
    }

    case "Status": {
      let color, status, imgUrl;

      if(item["OrderStatus"] === "DELIVERED") {
        color = "#C33";
        status = 'VERIFIED';
        imgUrl = item.IsChecked ? '/img/icon-ready-white.png' : '/img/icon-ready.png';
      } else if(item["OrderStatus"] !== "DELIVERED") {
        color = "#000";
        status = 'NOT VERIVIED';
        imgUrl = item.IsChecked ? '/img/icon-not-ready-white.png' : '/img/icon-not-ready.png';
      }

      const imgStyle = {
        width: 24,
        height: 24,
        display: 'inline-block',
        float: 'left'
      }

      return (
        <span style={{display: 'inline-block'}}>
          <img src={imgUrl} style={imgStyle}/>
          &nbsp;&nbsp;
          <span style={{lineHeight: '25px'}}>
            <TextCell text={status} />
          </span>
        </span>
      );
    }

    case "Checkbox": {
      return <UpdateOrdersCheckBox isChecked={item[keyword]} item={item} />
    }

    case "Link": {
      return <UpdateOrdersLink text={item[keyword]} item={item} to={'/orders/' + item.UserOrderID}/>
    }

    case "IDLink": {
      return <UpdateOrdersLink eds={item.UserOrderNumber} id={item.WebOrderID} item={item} to={'/orders/' + item.UserOrderID}/>
    }

    case "Datetime": {
      switch(keyword) {
        case "PickupTime": {
          let color, back;

          // const deadline = moment(moment(new Date(item[keyword])).diff(moment()));
          // console.log(moment(new Date(item[keyword])).valueOf(), moment().valueOf(), deadline.valueOf());
          
          const date = moment(new Date(item[keyword]));
          const dateTest = date.diff(moment([date.get('year'), date.get('month'), date.get('date'), 0, 0, 0, 0]));
          const now = moment();
          const nowTest = now.diff(moment([now.get('year'), now.get('month'), now.get('date'), 0, 0, 0, 0]));

          const deadline = nowTest - dateTest;

          // console.log(dateTest, nowTest, deadline);

          return <Interval startTime={deadline} down={true} />
        }
        default: {
          return <TextCell text={formatDateHourOnly(item[keyword])} />
        }
      }
    }

    default: {
      return null;
    }
  }
}

function UpdateOrdersBody({items}) {
  const body = Body(conf, updateOrdersColumns);

  const rows = lodash.map(items, (item, idx) => {
    const cells = lodash.map(body, (column) => {
      const cell = BodyComponent(column.type, column.keyword, item, idx);
      const className = styles.td + ' ' + styles[column.keyword];

      let style = {};
      if (item.IsChecked && column.type !== "Checkbox") {
        style.color = '#fff';
        style.backgroundColor = '#ff5a60';
      }

      return <td key={column.keyword} style={style} className={className}>{cell}</td>;
    });

    return <UpdateRow key={idx} cells={cells} item={item} />
  });

  return (
    <tbody>
      {rows}
    </tbody>
  );
}

export default UpdateOrdersBody;
