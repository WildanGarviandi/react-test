import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {ContainerDetailsActions} from '../../modules';
import {ButtonBase, ButtonWithLoading, DropdownTypeAhead, Modal, Page} from '../base';
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

const camelize = (str) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

const PrepareDriver = (driver) => {
  return camelize(driver.FirstName + ' ' + driver.LastName + ' (' + driver.CountryCode + driver.PhoneNumber + ')');
}

const DetailPage = React.createClass({
  getInitialState() {
    return {showModal: false, showDriver: false};
  },
  closeModal() {
    this.setState({showModal: false, showDriver: false});
  },
  clearContainer() {
    this.setState({showModal: true});
    this.props.clearContainer(this.props.container.ContainerID);
  },
  componentWillMount() {
    this.props.containerDetailsFetch(this.props.params.id);
    this.props.driversFetch();
  },
  goToFillContainer() {
    const {container} = this.props;
    this.props.goToFillContainer(container.ContainerID);
  },
  pickDriver(val) {
    const driver = _.find(this.props.drivers, (driver) => (val == PrepareDriver(driver.Driver)));
    this.setState({driverID: driver.Driver.UserID});
    console.log('driver', driver, val);
  },
  finalizeDriver() {
    this.setState({showDriver: true});
    this.props.driverPick(this.props.container.ContainerID,this.state.driverID);
  },
  render() {
    const {backToContainer, container, drivers,  driverState, driversName, emptying, fillAble, hasDriver, isFetching, orders, reusable} = this.props;
    const showEmptyingModal = this.state.showModal && !emptying.isInProcess && !emptying.isSuccess && emptying.error;
    const showDriverModal = this.state.showDriver && !driverState.isInProcess && !driverState.isSuccess && driverState.error;

    return (
      <div>
        {
          isFetching ? 
          <h3>Fetching Container Details...</h3> :
          <Page title={'Container ' + container.ContainerNumber}>
            <MessageModal show={showEmptyingModal} message={emptying.error} closeModal={this.closeModal} />
            <MessageModal show={showDriverModal} message={driverState.error} closeModal={this.closeModal} />
            <a href="javascript:;" onClick={backToContainer}>{'<<'} Back to Container List</a>
            {
              fillAble &&
              <ButtonWithLoading textBase={'Fill Container'} onClick={this.goToFillContainer} />
            }
            {
              reusable &&
              <ButtonWithLoading textBase={'Clear and Reuse Container'} textLoading={'Clearing Container'} isLoading={emptying.isInProcess} onClick={this.clearContainer} />
            }
            {
              hasDriver ? 
              <span>Current Driver: {PrepareDriver(hasDriver)}</span> :
                <span>
                  {
                    orders.length > 0 && 
                    <span>
                      <span>Drivers :</span>
                      <span className={styles.fillDriverWrapper}>
                        <DropdownTypeAhead options={driversName} selectVal={this.pickDriver} />
                      </span>
                      <ButtonWithLoading textBase="Set Driver" textLoading="Setting Driver" onClick={this.finalizeDriver} isLoading={driverState.isPicking} styles={{base: styles.driverBtn}} />
                    </span>
                  }
                </span>
            }
            <span style={{display: 'block', marginTop: 10}}>Total {orders.length} items</span>
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
  const drivers = state.app.drivers;
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
    emptying: emptying || {},
    drivers: drivers.drivers,
    driversName: _.chain(drivers.drivers).map((driver) => {
      return PrepareDriver(driver.Driver);
    }).sortBy((driver) => (driver)).value(),
    hasDriver: (container.CurrentTrip && container.CurrentTrip.Driver) || false,
    driverState: {
      isPicking: drivers.isPicking,
      isPicked: drivers.isPicked,
      error: drivers.error
    }
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
    },
    driversFetch: function() {
      dispatch(ContainerDetailsActions.fetchDrivers());
    },
    driverPick: function(containerID, driverID) {
      dispatch(ContainerDetailsActions.pickDriver(containerID, driverID));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailPage);
