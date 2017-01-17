import lodash from 'lodash';
import React from 'react';
import {push} from 'react-router-redux';
import {connect} from 'react-redux';
import {Body} from '../views/base/table';
import {conf, updateOrdersColumns} from './updateOrdersColumns';
import BodyRow, {CheckBoxCell, LinkCell, TextCell, OrderIDLinkCell} from '../views/base/cells';
import * as UpdateOrders from './updateOrdersService';
import {formatDate, formatDateHourOnly} from '../helper/time';
import {CheckboxCell} from '../views/base/tableCell';
import tableStyles from '../views/base/table.css';
import styles from './styles.css';
import moment from 'moment';

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
    let time = this.state.time;
    if (time < 0) {
      time *= -1;
    }
    return (
      <span>{formatDateHourOnly(time)}</span>
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
      <tr className={tableStyles.tr} onClick={this.startEditOrder}>{cells}</tr>
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

    case "Link": {
      return <UpdateOrdersLink text={item[keyword]} item={item} to={'/orders/' + item.UserOrderID}/>
    }

    case "IDLink": {
      return <UpdateOrdersLink eds={item.UserOrderNumber} id={item.WebOrderID} item={item} to={'/orders/' + item.UserOrderID}/>
    }

   case "Datetime": {
      switch(keyword) {
        case "Deadline": {
          const deadline = moment(new Date(item.Deadline));

          return (
            <span>
              { item.DeadlineDiff >= 0 &&
                <Interval startTime={item[keyword]} down={true} />
              }
              { item.DeadlineDiff < 0 &&
                <TextCell text={deadline.fromNow()} />
              }
            </span>
          )
        }
        default: {
          return <TextCell text={formatDate(item[keyword])} />
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
    const deadline = moment(new Date(item.Deadline));
    const now = moment();

    item.DeadlineDiff = deadline.diff(now);

    const cells = lodash.map(body, (column) => {
      const cell = BodyComponent(column.type, column.keyword, item, idx);
      const className = tableStyles.td + ' ' + tableStyles[column.keyword]  + ' ' + 
                        ((item.DeadlineDiff < 0 && column.keyword === 'Deadline') ? styles.redCell : '');

      return <td key={column.keyword} className={className}>{cell}</td>;
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
