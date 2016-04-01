import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import containerDetailsFetch from '../../modules/containers/actions/containerDetailsFetch';
import {ButtonAtRightTop, ButtonBase, PageTitle} from '../base';
import {OrderTable} from './table';

import styles from './styles.css';

const columns = ['id', 'id2', 'pickup', 'dropoff', 'time', 'action'];
const headers = [{
  id: 'Web Order ID', id2: 'User Order Number',
  pickup: 'Pickup Address', dropoff: 'Dropoff Address',
  time: 'Pickup Time', action: 'Action'
}];

const DetailPage = React.createClass({
  componentWillMount() {
    this.props.containerDetailsFetch(this.props.params.id);
  },
  goToFillContainer() {
    const {container} = this.props;
    this.props.goToFillContainer(container.ContainerID);
  },
  render() {
    const {backToContainer, container, fillAble, isFetching, orders} = this.props;

    return (
      <div>
        <a href="javascript:;" onClick={backToContainer}>{'<<'} Back to Container List</a>
        {
          isFetching ? 
          <h3>Fetching Container Details...</h3> :
          <div>
            {
              fillAble ?
              <ButtonAtRightTop val={'Fill Container'} onClick={this.goToFillContainer} /> :
              <span />
            }
            <PageTitle title={'Container ' + container.ContainerNumber} />
            <span>Total {orders.length} items</span>
            {
              orders.length > 0 ?
              <div>
                {
                  fillAble ?
                  <OrderTable columns={columns} headers={headers} items={orders} /> :
                  <OrderTable columns={columns.slice(0,5)} headers={headers} items={orders} />
                }
              </div>
              :
              <span />
            }
          </div>
        }
      </div>
    );
  }
});

const mapStateToProps = (state, ownProps) => {
  const containerID = ownProps.params.id;
  const {containers} = state.app.containers;
  const container = containers[containerID];

  if(!container) {
    return {isFetching: true};
  }

  const {fillAble, isFetching, orders} = container;
  return {
    container: container,
    orders: _.map(orders, (order) => ({
      id: order.WebOrderID,
      id2: order.UserOrderNumber,
      pickup: order.PickupAddress.Address1,
      dropoff: order.DropoffAddress.Address1,
      time: (new Date(order.PickupTime)).toString(),
      id3: order.UserOrderID,
      isDeleting: order.isDeleting
    })),
    isFetching: isFetching,
    fillAble: fillAble
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    backToContainer: function() {
      dispatch(push('/container'));
    },
    containerDetailsFetch: function(id) {
      dispatch(containerDetailsFetch(id));
    },
    goToFillContainer: function(id) {
      dispatch(push('/container/' + id + '/fill'));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailPage);
