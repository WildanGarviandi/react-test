import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import _ from 'underscore';
import containerFill from '../../modules/containers/actions/containerFill';
import orderToggle from '../../modules/containers/actions/orderToggle';
import districtsFetch from '../../modules/districts/actions/districtsFetch';
import {containerDistrictPick, containerDistrictReset} from '../../modules/containers/constants';
import {pickDistrict, selectedOrdersFetch} from '../../actions';
import {ButtonBase, Dropdown, PageTitle} from '../base';
import {OrderTable2} from './table';

const columns = ['id', 'id2', 'pickup', 'dropoff', 'time', 'status'];
const headers = [{
  id: 'Web Order ID', id2: 'User Order Number',
  pickup: 'Pickup Address', dropoff: 'Dropoff Address',
  time: 'Pickup Time', status: 'Status'
}];

import styles from './styles.css';

const FillComponent = React.createClass({
  getInitialState() {
    return {opened: false};
  },
  orderToggle(item) {
    this.props.orderToggle(item.id2);
  },
  componentDidMount() {
    this.props.districtsFetch();

    const {container} = this.props;
    this.props.resetDistrict(container.ContainerID);
  },
  toggleOpened() {
    this.setState({opened: !this.state.opened});
  },
  selectDistrict(val) {
    this.setState({opened: false});
    const selectedDistrict = _.find(this.props.districts, (district) => (district.Name == val));
    const {container} = this.props;
    this.props.pickDistrict(container.ContainerID, selectedDistrict.DistrictID);    
  },
  fillContainer() {
    const {container, validOrders, activeDistrict} = this.props;
    const orders = _.chain(validOrders).filter((order) => (order.checked)).map((order) => (order.id3)).value();
    this.props.fillContainer(container.ContainerNumber, orders, activeDistrict.DistrictID);
  },
  handleBack() {
    const {container} = this.props;
    this.props.backToContainer(container.ContainerID);
  },
  render() {
    const {activeDistrict, container, districts, HaveContainerIDs, haveMore, haveTried, InvalidIDs, isFilling, ValidIDs, validOrders} = this.props;
    const districtsName = _.map(districts, (district) => (district.Name));

    return (
      <div>
        { InvalidIDs.length == 0 ? 
          <div /> :
          <div> 
            <h4>Invalid ID ({InvalidIDs.length} items)</h4>
            <span>{InvalidIDs.join(' ')}</span>
          </div> }
        { HaveContainerIDs.length == 0 ? 
          <div /> : 
          <div> 
            <h4>Already Have Container ({HaveContainerIDs.length} items)</h4>
            <span>{HaveContainerIDs.join(' ')}</span>
          </div> }
        { ValidIDs.length == 0 ? 
          <div /> : 
          <div>
            <div style={{float: 'right'}}>
              <h4 style={{marginBottom: '10px', display: 'inline-block'}}>District: </h4>
              <Dropdown opened={this.state.opened} val={activeDistrict.Name} options={districtsName} onClick={this.toggleOpened} selectVal={this.selectDistrict} width={'150px'} />
            </div>
            <h4>Valid Order ({ValidIDs.length} items)</h4>
            <OrderTable2 headers={headers} columns={columns} items={validOrders} rowClicked={this.orderToggle} />
            {
              !isFilling ?
              <div>
              {
                haveTried ?
                <div>
                  {
                    haveMore.length > 0 ?
                    <ButtonBase className={styles.modalBtn} onClick={this.fillContainer}>Try again on {container.ContainerNumber}</ButtonBase> :
                    <span />
                  }
                  <ButtonBase className={styles.modalBtn} onClick={this.handleBack}>Done</ButtonBase>
                </div>              
                :
                <ButtonBase className={styles.modalBtn} onClick={this.fillContainer}>Put on {container.ContainerNumber}</ButtonBase>
              }
              </div> :
              <span style={{float: 'right'}}>Filling Container ...</span>
            }
          </div> 
        }
      </div>
    );
  }
});

function InvalidIDs(ids, orders) {
  return _.filter(ids, (id) => !(_.find(orders, (order) => (order.UserOrderNumber == id))));
}

function HaveContainer(ids, containers) {
  return _.filter(ids, (id) => {
    return id in containers;
  });
}

function ValidIDs(ids, orders, containers) {
  return _.filter(ids, (id) => {
    return (_.find(orders, (order) => (order.UserOrderNumber == id))) && !(id in containers);
  });
}

const FillState = (state) => {
  const {ids, containers, orders} = state.app.ordersPrepared;
  const validIDs = ValidIDs(ids, orders, containers);
  const container = _.find(state.app.containers.containers, (container) => (container.ContainerID == state.app.containers.active));
  const trip = container.trip;
  const {active, districts} = state.app.districts;
  const isFilling = state.app.ordersPrepared.isFilling;
  const validOrders = _.map(validIDs, (id) => {
    const order = _.find(orders, (order) => (order.UserOrderNumber == id));
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
  });

  return {
    InvalidIDs: InvalidIDs(ids, orders),
    HaveContainerIDs: HaveContainer(ids, containers),
    ValidIDs: validIDs,
    container: container,
    districts: districts,
    activeDistrict: _.find(districts, (district) => (district.DistrictID == container.district)) || {},
    haveTried: _.find(orders, (order) => (order.status != '')),
    validOrders: validOrders,
    haveMore: _.filter(validOrders, (order) => {
      return order.status != 'Success'
    }),
    isFilling: isFilling
  }
}

const FillDispatch = (dispatch, ownProps) => {
  return {
    backToContainer: function(id) {
      dispatch(push('/container/' + id));
    },
    orderToggle: function(id) {
      dispatch(orderToggle(id));
    },
    districtsFetch: function() {
      dispatch(districtsFetch());
    },
    pickDistrict: function(id1, id2) {
      dispatch(containerDistrictPick(id1, id2));
    },
    resetDistrict: function(id) {
      dispatch(containerDistrictReset(id));
    },
    fillContainer: function(containerNumber, ordersID, districtID) {
      dispatch(containerFill(containerNumber, ordersID, districtID));
    }
  };
}

const FillContainer = connect(FillState, FillDispatch)(FillComponent);

const FillPage = React.createClass({
  render() {
    const {backToContainer, container, showFetch} = this.props;
    return (
      <div>
        <a href="javascript:;" onClick={backToContainer}>{'<<'} Back to Container Detail</a>
        <div>
          <PageTitle title={'Container ' + container.ContainerNumber} />
          <FillContainer />
        </div>
      </div>
    );
  }
});

const mapStateToProps = (state, ownProps) => {
  const {containers, ordersPrepared} = state.app;
  const container = _.find(containers.containers, (container) => (container.ContainerID == containers.active));
  const {isFetching, isValid, error, ids} = ordersPrepared;
  return {
    container: container
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    backToContainer: function() {
      dispatch(push('/container/' + ownProps.params.id));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FillPage);
