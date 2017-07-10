import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {StatusList} from '../../modules';
import {Infograph} from '../base';
import * as PickupOrders from '../../modules/pickupOrders';

const Infographic = React.createClass({
  componentWillMount() {
    this.props.fetchCount();
  },
  handleFilter(attr) {
    this.props.pickStatus(attr);
  },
  render() {
    const {infographicData} = this.props;
    const Info = _.map(infographicData, ({val, key}) => {
      return <Infograph key={key} attr={key} val={val} onClick={this.handleFilter} />;
    });

    return (
      <div>
        {Info}
        <div style={{clear: 'both'}} />
      </div>
    );
  }
});

const stateToProps = (state) => {
  const {infographicCount, infographicStatus} = state.app.pickupOrders;
  const infographicData = lodash.map(infographicStatus, (status) => {
    return {
      key: status,
      val: infographicCount[status],
    }
  });

  return {
    infographicData,
  }
}

const dispatchToProps = (dispatch) => {
  return {
    fetchCount: () => {
      dispatch(PickupOrders.FetchInfographic());
    },
    pickStatus: function(keyword) {
      dispatch(PickupOrders.FilterByKeyword(keyword));
    },
  }
}

export default connect(stateToProps, dispatchToProps)(Infographic);
