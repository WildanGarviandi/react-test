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
import inboundStyles from './styles.css';
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
    let time = this.state.time;
    if (time < 0) {
      time *= -1;
    }
    return (
      <span>{formatDateHourOnly(time)}</span>
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
        case "Deadline": {
          const deadline = moment(new Date(item['CutOffTime'])).add(6, 'hour');

          return (
            <span>
              { item[keyword] >= 0 &&
                <Interval startTime={item[keyword]} down={true} />
              }
              { item[keyword] < 0 &&
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

function InboundOrdersBody({items}) {
  const body = Body(conf, inboundOrdersColumns);

  const rows = lodash.map(items, (item, idx) => {
    
    const date = moment(new Date(item['CutOffTime']));
    const now = moment();
    const deadline = date.add(6, 'hour');

    item.Deadline = deadline.diff(now);

    const cells = lodash.map(body, (column) => {
      const cell = BodyComponent(column.type, column.keyword, item, idx);
      const className = styles.td + ' ' + styles[column.keyword]  + ' ' + 
                        ((item.Deadline < 0 && column.keyword === 'Deadline') ? inboundStyles.redCell : '');

      return <td key={column.keyword} className={className}>{cell}</td>;
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
