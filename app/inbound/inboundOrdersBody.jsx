import React, { Component } from 'react';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';

import * as _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';

import { Body } from '../views/base/table';
import { conf, inboundOrdersColumns } from './inboundOrdersColumns';
import { TextCell, OrderIDLinkCell } from '../views/base/cells';
import { formatDate, formatDateHourOnly } from '../helper/time';
import styles from '../views/base/table.scss';
import inboundStyles from './styles.scss';
import config from '../config/configValues.json';

function mapDispatchToLink(dispatch, ownParams) {
  const dispatchFunc = {
    onClick: () => {
      dispatch(push(`/orders/${ownParams.item.UserOrderID}`));
    },
  };

  return dispatchFunc;
}

const InboundOrdersLink = connect(undefined, mapDispatchToLink)(OrderIDLinkCell);

class Interval extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: this.props.startTime,
    };
  }
  componentDidMount() {
    this.interval = setInterval(() => {
      if (this.props.down) {
        this.tickDown();
      } else {
        this.tickUp();
      }
    }, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  tickDown() {
    this.setState({
      time: this.state.time - 1000,
    });
  }
  tickUp() {
    this.setState({
      time: this.state.time + 1000,
    });
  }
  render() {
    let time = this.state.time;
    if (time < 0) {
      time *= -1;
    }
    return (
      <span>{formatDateHourOnly(time)}</span>
    );
  }
}

/* eslint-disable */
Interval.propTypes = {
  startTime: PropTypes.any,
  down: PropTypes.boolean,
};
/* eslint-enable */

Interval.defaultProps = {
  startTime: {},
  down: false,
};

function BodyComponent(type, keyword, item, deadlineDiff) {
  switch (type) {
    case 'String': {
      return <TextCell text={item[keyword]} />;
    }

    case 'Link': {
      return <InboundOrdersLink text={item[keyword]} item={item} to={`/orders/${item.UserOrderID}`} />;
    }

    case 'IDLink': {
      return <InboundOrdersLink eds={item.UserOrderNumber} id={item.WebOrderID} item={item} to={`/orders/${item.UserOrderID}`} />;
    }

    case 'Datetime': {
      switch (keyword) {
        case 'Deadline': {
          const deadline = moment(new Date(item.CutOffTime)).add(config.inboundDeadlineFromCutOffTime, 'hour');
          return (
            <span>
              {deadlineDiff >= 0 &&
                <Interval startTime={deadlineDiff} down />
              }
              {deadlineDiff < 0 &&
                <TextCell text={deadline.fromNow()} />
              }
            </span>
          );
        }
        default: {
          return <TextCell text={formatDate(item[keyword])} />;
        }
      }
    }

    default: {
      return null;
    }
  }
}

function InboundOrdersBody({ items }) {
  const body = Body(conf, inboundOrdersColumns);

  const rows = _.map(items, (item, idx) => {
    const date = moment(new Date(item.CutOffTime));
    const now = moment();
    const deadline = date.add(config.inboundDeadlineFromCutOffTime, 'hour');

    const deadlineDiff = deadline.diff(now);

    const cells = _.map(body, (column) => {
      const cell = BodyComponent(column.type, column.keyword, item, deadlineDiff);
      const className = `${styles.td} ${styles[column.keyword]}
       ${(deadlineDiff < 0 && column.keyword === 'Deadline') ? inboundStyles.redCell : ''}`;

      return <td key={column.keyword} className={className}>{cell}</td>;
    });

    return <tr key={idx} className={`${styles.tr} ${inboundStyles.noPointer}`}>{cells}</tr>;
  });

  return (
    <tbody>
      {rows}
    </tbody>
  );
}

/* eslint-disable */
InboundOrdersBody.propTypes = {
  items: PropTypes.array,
};
/* eslint-enable */

InboundOrdersBody.defaultProps = {
  items: [],
};

export default InboundOrdersBody;
