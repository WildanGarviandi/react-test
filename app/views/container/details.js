import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {ContainerDetailsActions} from '../../modules';
import {ButtonBase, ButtonWithLoading, Modal, Page} from '../base';
import {OrderTable} from './table';

import styles from './styles.css';

const columns = ['id', 'id2', 'pickup', 'dropoff', 'time', 'status', 'action'];
const headers = [{
  id: 'Web Order ID', id2: 'User Order Number',
  pickup: 'Pickup Address', dropoff: 'Dropoff Address',
  time: 'Pickup Time', status: 'Order Status', action: 'Action'
}];

const MessageModal = React.createClass({
  handleClose() {
    const {closeModal} = this.props;
    closeModal();
  },
  render() {
    const {message, show} = this.props;

    return (
      <Modal show={show} width={250}>
        {message}
        <br/>
        <ButtonBase onClick={this.handleClose} styles={styles.modalBtn}>Close</ButtonBase>
      </Modal>
    );
  }
});

const DetailPage = React.createClass({
  getInitialState() {
    return {showModal: false};
  },
  closeModal() {
    this.setState({showModal: false});
  },
  clearContainer() {
    this.setState({showModal: true});
    this.props.clearContainer(this.props.container.ContainerID);
  },
  componentWillMount() {
    this.props.containerDetailsFetch(this.props.params.id);
  },
  goToFillContainer() {
    const {container} = this.props;
    this.props.goToFillContainer(container.ContainerID);
  },
  render() {
    const {backToContainer, container, emptying, fillAble, isFetching, orders, reusable} = this.props;
    const showEmptyingModal = this.state.showModal && !emptying.isInProcess && !emptying.isSuccess && emptying.error;

    return (
      <div>
        {
          isFetching ? 
          <h3>Fetching Container Details...</h3> :
          <Page title={'Container ' + container.ContainerNumber}>
            <MessageModal show={showEmptyingModal} message={emptying.error} closeModal={this.closeModal} />
            <a href="javascript:;" onClick={backToContainer}>{'<<'} Back to Container List</a>
            {
              fillAble &&
              <ButtonWithLoading textBase={'Fill Container'} onClick={this.goToFillContainer} />
            }
            {
              reusable &&
              <ButtonWithLoading textBase={'Clear and Reuse Container'} textLoading={'Clearing Container'} isLoading={emptying.isInProcess} onClick={this.clearContainer} />
            }
            <span>Total {orders.length} items</span>
            {
              orders.length > 0 ?
              <div>
                {
                  fillAble ?
                  <OrderTable columns={columns} headers={headers} items={orders} /> :
                  <OrderTable columns={columns.slice(0,6)} headers={headers} items={orders} />
                }
              </div>
              :
              <span />
            }
          </Page>
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

  const {emptying, fillAble, reusable, isFetching, orders} = container;
  return {
    container: container,
    orders: _.map(orders, (order) => ({
      id: order.WebOrderID,
      id2: order.UserOrderNumber,
      pickup: order.PickupAddress.Address1,
      dropoff: order.DropoffAddress.Address1,
      time: (new Date(order.PickupTime)).toString(),
      id3: order.UserOrderID,
      isDeleting: order.isDeleting,
      status: order.Status
    })),
    isFetching: isFetching,
    fillAble: fillAble,
    reusable: reusable,
    emptying: emptying || {}
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    backToContainer: function() {
      dispatch(push('/container'));
    },
    clearContainer: function(id) {
      dispatch(ContainerDetailsActions.clearContainer(id));
    },
    containerDetailsFetch: function(id) {
      dispatch(ContainerDetailsActions.fetchDetails(id));
    },
    goToFillContainer: function(id) {
      dispatch(push('/container/' + id + '/fill'));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailPage);
