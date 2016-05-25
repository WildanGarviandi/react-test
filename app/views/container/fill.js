import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import _ from 'underscore';
import classNaming from 'classnames';

import {FillActions} from '../../modules';
import containerFill from '../../modules/containers/actions/containerFill';
import containerFillEverything from '../../modules/containers/actions/containerFillEverything';
// import orderToggle from '../../modules/containers/actions/orderToggle';
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

const columns = ['check', 'id', 'id2', 'pickup', 'dropoff', 'time', 'CODValue'];
const headers = [{
  check: '',
  id: 'Web Order ID', id2: 'User Order Number',
  pickup: 'Pickup Address', dropoff: 'Dropoff Address',
  time: 'Pickup Time', status: 'Status',
  CODValue: 'COD Value',
}];

import styles from './styles.css';

const PrepareOrder = (order) => {
  return {
    id: order.WebOrderID,
    id2: order.UserOrderNumber,
    id3: order.UserOrderID,
    pickup: order.PickupAddress.Address1,
    dropoff: order.DropoffAddress.Address1,
    time: (new Date(order.PickupTime)).toString(),
    checked: order.checked,
    status: order.status,
    CODValue: order.IsCOD ? order.TotalValue : 0,
  }
}

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
          <div>
          {
            _.map(failedRes, (res) => {
              return <div>{res.orderNumber}: {res.error}</div>;
            })
          }
          </div>
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
    const {container, ordersPrepared, fillContainer} = this.props;

    const orders = _.chain(ordersPrepared.orders).filter((order) => (order.checked)).map((order) => (order.UserOrderID)).value();
    if(orders.length == 0) {
      alert('No order selected');
      return;
    }

    fillContainer(container.ContainerNumber, orders);
    this.setState({showModal: true});
  },
  putEverything() {
    const {container, ordersPrepared, fillEverything} = this.props;

    fillEverything(container.ContainerNumber, ordersPrepared.ids);
    this.setState({showModal: true});
  },
  render() {
    const {ordersPrepared} = this.props;
    const isFetching = ordersPrepared.isFetching;
    const isFilling = ordersPrepared.isFilling;
    const orders = _.map(ordersPrepared.orders, (order) => (PrepareOrder(order)));
    const {limit, currentPage} = ordersPrepared;

    let successRes = [], failedRes = [];
    if(ordersPrepared.results) {
      successRes = _.filter(ordersPrepared.results, (res) => (res.status == 'Success'));
      failedRes = _.filter(ordersPrepared.results, (res) => (res.status == 'Failed'));
    }

    return (
      <div>
        <Modal show={!ordersPrepared.isFilling && ordersPrepared.results && this.state.showModal} width={700}>
          <ResultModal successRes={successRes} failedRes={failedRes} closeModal={this.closeModal} />
        </Modal>
        <span className={styles.topRightBtnWrapper}>
          {
            isFilling &&
            <span style={{float: 'right'}}>Filling Container...</span>
          }
          {
            !isFilling &&
            <ButtonBase styles={styles.modalBtn} onClick={this.fillContainer}>{'Fill Container with Selected Orders'}</ButtonBase>
          }
          {
            !isFilling && (ordersPrepared.checkAll || ordersPrepared.ids.length > 0) &&
            <ButtonBase styles={styles.fillBtn} onClick={this.putEverything}>{'Put Every Order into Container'}</ButtonBase>
          }
        </span>
        <div style={{clear: 'both', marginBottom: 10}} />
        <Filter />
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
    this.props.ordersPrepareIDs([]);
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
  const {containers, ordersPrepared} = state.app;
  const container = containers.containers[containers.active];

  if(!container) return { isFetchingContainer: true, container: {} };

  return {
    container: container,
    isFetchingContainer: container.isFetching,
    fillFormState: {
      ordersPrepared: ordersPrepared,
    },
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
      fillContainer: function(containerNumber, ordersID, districtID) {
        dispatch(FillActions.fillContainer(containerNumber, ordersID, districtID));
      },
      fillEverything: function(containerNumber, ordersID, districtID) {
        dispatch(containerFillEverything(containerNumber, ordersID, districtID));
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
    ordersPrepareIDs: function(ids) {
      dispatch(ordersPrepareIDs(ids));
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FillComponent);
