import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import _ from 'underscore';
import classNaming from 'classnames';

import {FillActions} from '../../modules';
import containerFill from '../../modules/containers/actions/containerFill';
import containerFillEverything from '../../modules/containers/actions/containerFillEverything';
// import orderToggle from '../../modules/containers/actions/orderToggle';
import districtsFetch from '../../modules/districts/actions/districtsFetch';
import containerDetailsFetch from '../../modules/containers/actions/containerDetailsFetch';
import ordersPrepare from '../../modules/containers/actions/ordersPrepare';
import ordersPrepareCurrentPage from '../../modules/containers/actions/ordersPrepareCurrentPage';
import ordersPrepareIDs from '../../modules/containers/actions/ordersPrepareIDs';
import ordersPrepareLimit from '../../modules/containers/actions/ordersPrepareLimit';
import orderToggle from '../../modules/containers/actions/orderToggle';
import {containerDistrictPick, containerDistrictReset} from '../../modules/containers/constants';
import {ButtonBase, ButtonWithLoading, Dropdown, DropdownTypeAhead, Modal, Page, Pagination} from '../base';
import {OrderTable2} from './table';
import Filter from './accordion';

const columns = ['check', 'id', 'id2', 'pickup', 'dropoff', 'time'];
const headers = [{
  check: '',
  id: 'Web Order ID', id2: 'User Order Number',
  pickup: 'Pickup Address', dropoff: 'Dropoff Address',
  time: 'Pickup Time', status: 'Status'
}];

import styles from './styles.css';

const camelize = (str) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

const PrepareOrder = (order) => {
  return {
    id: order.WebOrderID,
    id2: order.UserOrderNumber,
    id3: order.UserOrderID,
    pickup: order.PickupAddress.Address1,
    dropoff: order.DropoffAddress.Address1,
    time: (new Date(order.PickupTime)).toString(),
    checked: order.checked,
    status: order.status
  }
}

const PrepareDriver = (driver) => {
  return camelize(driver.Driver.FirstName + ' ' + driver.Driver.LastName + ' (' + driver.Driver.CountryCode + driver.Driver.PhoneNumber + ')');
}

function isEmpty(obj) {
  if (obj == null) return true;

  if (obj.length > 0)    return false;
  if (obj.length === 0)  return true;

  for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
}

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

const ResultModal = React.createClass({
  render() {
    const {successRes, failedRes} = this.props;
    return (
      <div>
        <h4 style={{marginTop: 0}}>Filling Results</h4>
        <div style={{marginBottom: 20}}>
          <span>Successfully put into container: ({successRes.length} items)</span>
          <div>{_.map(successRes, (res) => (res.orderNumber)).join(' ')}</div>
        </div>
        <div>
          <span>Failed to put into container: ({failedRes.length} items)</span>
          <div>{_.map(failedRes, (res) => (res.orderNumber)).join(' ')}</div>
        </div>
        <ButtonBase styles={styles.modalBtn} onClick={this.props.closeModal}>OK</ButtonBase>
      </div>
    );
  }
})

const FillForm = React.createClass({
  getInitialState() {
    return {opened: false, showModal: false, driverID: 0, districtError: false};
  },
  toggleOpened() {
    this.setState({opened: !this.state.opened});
  },
  selectDistrict(val) {
    this.setState({opened: false, districtError: false});
    const selectedDistrict = _.find(this.props.districts, (district) => (district.Name == val));
    const {container} = this.props;
    this.props.pickDistrict(container.ContainerID, selectedDistrict.DistrictID);    
  },
  closeModal() {
    this.setState({showModal: false});
    const {limit, currentPage} = this.props.ordersPrepared;
    this.props.ordersPrepareFetch(limit, (currentPage-1)*limit);
  },
  closeModal2() {
    this.setState({showModal: false});
  },
  setLimit(val) {
    this.props.ordersPrepareLimit(val);
  },
  setCurrentPage(val) {
    this.props.ordersPrepareCurrentPage(val);
  },
  handleRowClick(item) {
    const {orderToggle} = this.props;
    orderToggle(item.id2);
  },
  fillContainer() {
    const {container, activeDistrict, ordersPrepared, fillContainer} = this.props;
    if(isEmpty(activeDistrict)) {
      alert('Please choose a district for this container')
      this.setState({districtError: true});
      return;
    }

    const orders = _.chain(ordersPrepared.orders).filter((order) => (order.checked)).map((order) => (order.UserOrderID)).value();
    if(orders.length == 0) {
      alert('No order selected');
      return;
    }

    fillContainer(container.ContainerNumber, orders, activeDistrict.DistrictID, this.state.driverID);
    this.setState({showModal: true});
  },
  putEverything() {
    const {container, activeDistrict, ordersPrepared, fillEverything} = this.props;
    if(isEmpty(activeDistrict)) {
      alert('Please choose a district for this container')
      this.setState({districtError: true});
      return;
    }
    fillEverything(container.ContainerNumber, ordersPrepared.ids, activeDistrict.DistrictID, this.state.driverID);
    this.setState({showModal: true});
  },
  pickDriver(val) {
    const driver = _.find(this.props.drivers, (driver) => (val == PrepareDriver(driver)));
    this.setState({driverID: driver.Driver.UserID});
    console.log('driver', driver, val);
  },
  render() {
    const {activeDistrict, districts, driversName, ordersPrepared} = this.props;
    const isFetching = ordersPrepared.isFetching;
    const isFilling = ordersPrepared.isFilling;
    const orders = _.map(ordersPrepared.orders, (order) => (PrepareOrder(order)));
    const {limit, currentPage} = ordersPrepared;
    const districtsName = _.map(districts, (district) => (district.Name));

    let successRes = [], failedRes = [];
    if(ordersPrepared.results) {
      successRes = _.filter(ordersPrepared.results.result, (res) => (res.status == 'Success'));
      failedRes = _.filter(ordersPrepared.results.result, (res) => (res.status == 'Failed'));
    }

    return (
      <div>
        <Modal show={!ordersPrepared.isFilling && ordersPrepared.results && this.state.showModal} width={700}>
          <ResultModal successRes={successRes} failedRes={failedRes} closeModal={this.closeModal} />
        </Modal>
        <MessageModal show={!ordersPrepared.isFilling && !ordersPrepared.results && this.state.showModal} message={ordersPrepared.errorMessage} closeModal={this.closeModal2} />
        <Filter />
        {
          isFilling ? 
          <span style={{float: 'right'}}>Filling Container...</span> :
          <span>
            <ButtonBase styles={styles.modalBtn} onClick={this.fillContainer}>{'Fill Container with Selected Orders'}</ButtonBase>
            {
              (ordersPrepared.checkAll || ordersPrepared.ids.length > 0) &&
              <ButtonBase styles={styles.fillBtn} onClick={this.putEverything}>{'Put Every Order into Container'}</ButtonBase>
            }
          </span>
        }
        <span>Districts :</span>
        <span className={classNaming(styles.fillDriverWrapper, {[styles.error]: this.state.districtError})}>
          <DropdownTypeAhead options={districtsName} selectVal={this.selectDistrict} val={activeDistrict.Name} />
        </span>
        <span style={{marginLeft: 10}}>Drivers :</span>
        <span className={styles.fillDriverWrapper}>
          <DropdownTypeAhead options={driversName} selectVal={this.pickDriver} />
        </span>
        <div style={{clear: 'both', marginBottom: 10}} />
        <Pagination limit={limit} totalItem={ordersPrepared.count} currentPage={currentPage} setLimit={this.setLimit} setCurrentPage={this.setCurrentPage} />
        <div style={isFetching || isFilling ? {opacity: 0.5} : {}}>
          <OrderTable2 headers={[_.assign({}, headers[0], {checked: ordersPrepared.checkAll})]} columns={columns} items={orders} rowClicked={this.handleRowClick}/>
        </div>
      </div>
    );
  }
});

const FillComponent = React.createClass({
  componentDidMount() {
    this.props.containerDetailsFetch();
    this.props.districtsFetch();
    this.props.ordersPrepareIDs([]);
    this.props.driversFetch();
  },
  componentWillReceiveProps(newProps) {
    if(!newProps.isFetchingContainer && !newProps.container.fillAble) {
      this.props.backToContainer(newProps.container.ContainerID);
      return;
    }

    const {fillFormState} = this.props;
    if(fillFormState && fillFormState.ordersPrepared && fillFormState.ordersPrepared.results) {
      const results = fillFormState.ordersPrepared.results;
      if(results.trip && results.trip.OrderStatus && results.trip.OrderStatus.OrderStatus == 'ACCEPTED') {
        this.props.backToContainer(this.props.container.ContainerID);
      }
    }
  },
  handleBack() {
    const {container} = this.props;
    this.props.backToContainer(container.ContainerID);
  },
  render() {
    const {fillFormFunction, fillFormState, backToContainer, container, isFetchingContainer} = this.props;

    return (
      <div style={{paddingBottom: 200}}>
        {
          isFetchingContainer ?
          <span><br/>Fetching container data...</span> :
          <Page title={'Container ' + container.ContainerNumber}>
            <a href="javascript:;" onClick={backToContainer}>{'<<'} Back to Container Detail</a>
            <FillForm {...fillFormFunction} {...fillFormState} container={container} />
          </Page>
        }
      </div>
    );
  }
});

const mapStateToProps = (state, ownProps) => {
  const {containers, drivers, ordersPrepared} = state.app;
  const container = containers.containers[containers.active];

  if(!container) return { isFetchingContainer: true, container: {} };
  const {districts} = state.app.districts;

  return {
    container: container,
    isFetchingContainer: container.isFetching,
    fillFormState: {
      activeDistrict: _.find(districts, (district) => (district.DistrictID == container.district)) || {},
      districts: districts,
      ordersPrepared: ordersPrepared,
      drivers: drivers.drivers,
      driversName: _.chain(drivers.drivers).map((driver) => {
        return PrepareDriver(driver);
      }).sortBy((driver) => (driver)).value()
    }
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fillFormFunction: {
      orderToggle: function(id) {
        dispatch(orderToggle(id));
      },
      ordersPrepareLimit: function(val) {
        dispatch(ordersPrepareLimit(val));
      },
      ordersPrepareCurrentPage: function(val) {
        dispatch(ordersPrepareCurrentPage(val));
      },
      pickDistrict: function(id1, id2) {
        dispatch(containerDistrictPick(id1, id2));
      },
      fillContainer: function(containerNumber, ordersID, districtID, driverID) {
        dispatch(FillActions.fillContainer(containerNumber, ordersID, districtID, driverID));
      },
      fillEverything: function(containerNumber, ordersID, districtID, driverID) {
        dispatch(containerFillEverything(containerNumber, ordersID, districtID, driverID));
      },
      ordersPrepareFetch: function() {
        dispatch(ordersPrepare());
      }
    },
    backToContainer: function() {
      dispatch(push('/container/' + ownProps.params.id));
    },
    containerDetailsFetch: function() {
      dispatch(containerDetailsFetch(ownProps.params.id));
    },
    resetDistrict: function(id) {
      dispatch(containerDistrictReset(id));
    },
    districtsFetch: function() {
      dispatch(districtsFetch());
    },
    ordersPrepareIDs: function(ids) {
      dispatch(ordersPrepareIDs(ids));
    },
    driversFetch: function() {
      dispatch(FillActions.fetchDrivers());
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FillComponent);
