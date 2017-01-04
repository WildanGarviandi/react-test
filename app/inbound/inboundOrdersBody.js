import lodash from 'lodash';
import React from 'react';
import {push} from 'react-router-redux';
import {connect} from 'react-redux';
import {Body} from '../views/base/table';
import {conf, inboundOrdersColumns} from './inboundOrdersColumns';
import BodyRow, {CheckBoxCell, LinkCell, TextCell, OrderIDLinkCell} from '../views/base/cells';
import * as InboundOrders from './inboundOrdersService';
import {formatDate, formatDateHourOnly} from '../helper/time';
import {CheckboxCell} from '../views/base/tableCell';
import styles from '../views/base/table.css';
import ReactInterval from 'react-interval';
import moment from 'moment';

function mapDispatchToLink(dispatch, ownParams) {
  return {
    onClick: function() {
      dispatch(push('/orders/' + ownParams.item.UserOrderID));
    }
  }
}

const InboundOrdersLink = connect(undefined, mapDispatchToLink)(OrderIDLinkCell);

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

function BodyComponent(type, keyword, item, index) {
  switch(type) {
    case "String": {
      return <TextCell text={item[keyword]} />
    }

    case "Link": {
      return <InboundOrdersLink text={item[keyword]} item={item} to={'/orders/' + item.UserOrderID}/>
    }

    case "IDLink": {
      return <InboundOrdersLink eds={item.UserOrderNumber} id={item.WebOrderID} item={item} to={'/orders/' + item.UserOrderID}/>
    }

    case "Datetime": {
      switch(keyword) {
        case "PickupTime": {

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
          return <TextCell text={formatDate(item[keyword])} />
        }
      }
    }

    default: {
      return null;
    }
  }
}

function InboundOrdersBody({items}) {
  const body = Body(conf, inboundOrdersColumns);

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

    return <tr key={idx} className={styles.tr}>{cells}</tr>
  });

  return (
    <tbody>
      {rows}
    </tbody>
  );
}

export default InboundOrdersBody;
