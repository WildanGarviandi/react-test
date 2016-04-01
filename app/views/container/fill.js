import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import _ from 'underscore';
import containerFill from '../../modules/containers/actions/containerFill';
import containerFillEverything from '../../modules/containers/actions/containerFillEverything';
// import orderToggle from '../../modules/containers/actions/orderToggle';
import districtsFetch from '../../modules/districts/actions/districtsFetch';
import containerDetailsFetch from '../../modules/containers/actions/containerDetailsFetch';
import ordersPrepare from '../../modules/containers/actions/ordersPrepare';
import ordersPrepareCurrentPage from '../../modules/containers/actions/ordersPrepareCurrentPage';
import ordersPrepareIDs from '../../modules/containers/actions/ordersPrepareIDs';
import ordersPrepareLimit from '../../modules/containers/actions/ordersPrepareLimit';
import ordersPrepareToggleAll from '../../modules/containers/actions/orderToggleAll';
import orderToggle from '../../modules/containers/actions/orderToggle';
import orderToggleAll from '../../modules/containers/actions/orderToggleAll';
import {containerDistrictPick, containerDistrictReset} from '../../modules/containers/constants';
import {ButtonBase, Dropdown, Modal, PageTitle, Pagination} from '../base';
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

// const FillComponent = React.createClass({
//   getInitialState() {
//     return {opened: false};
//   },
//   orderToggle(item) {
//     this.props.orderToggle(item.id2);
//   },
//   componentDidMount() {
//     this.props.districtsFetch();

//     const {container} = this.props;
//     this.props.resetDistrict(container.ContainerID);
//   },
//   toggleOpened() {
//     this.setState({opened: !this.state.opened});
//   },
//   selectDistrict(val) {
//     this.setState({opened: false});
//     const selectedDistrict = _.find(this.props.districts, (district) => (district.Name == val));
//     const {container} = this.props;
//     this.props.pickDistrict(container.ContainerID, selectedDistrict.DistrictID);    
//   },
//   fillContainer() {
//     const {container, validOrders, activeDistrict} = this.props;
//     const orders = _.chain(validOrders).filter((order) => (order.checked)).map((order) => (order.id3)).value();
//     this.props.fillContainer(container.ContainerNumber, orders, activeDistrict.DistrictID);
//   },
//   handleBack() {
//     const {container} = this.props;
//     this.props.backToContainer(container.ContainerID);
//   },
//   render() {
//     const {activeDistrict, container, districts, HaveContainerIDs, haveMore, haveTried, InvalidIDs, isFilling, ValidIDs, validOrders} = this.props;
//     const districtsName = _.map(districts, (district) => (district.Name));

//     return (
//       <div>
//         { InvalidIDs.length == 0 ? 
//           <div /> :
//           <div> 
//             <h4>Invalid ID ({InvalidIDs.length} items)</h4>
//             <span>{InvalidIDs.join(' ')}</span>
//           </div> }
//         { HaveContainerIDs.length == 0 ? 
//           <div /> : 
//           <div> 
//             <h4>Already Have Container ({HaveContainerIDs.length} items)</h4>
//             <span>{HaveContainerIDs.join(' ')}</span>
//           </div> }
//         { ValidIDs.length == 0 ? 
//           <div /> : 
//           <div>
//             <div style={{float: 'right'}}>
//               <h4 style={{marginBottom: '10px', display: 'inline-block'}}>District: </h4>
//               <Dropdown opened={this.state.opened} val={activeDistrict.Name} options={districtsName} onClick={this.toggleOpened} selectVal={this.selectDistrict} width={'150px'} />
//             </div>
//             <h4>Valid Order ({ValidIDs.length} items)</h4>
//             <OrderTable2 headers={headers} columns={columns} items={validOrders} rowClicked={this.orderToggle} />
//             {
//               !isFilling ?
//               <div>
//               {
//                 haveTried ?
//                 <div>
//                   {
//                     haveMore.length > 0 ?
//                     <ButtonBase className={styles.modalBtn} onClick={this.fillContainer}>Try again on {container.ContainerNumber}</ButtonBase> :
//                     <span />
//                   }
//                   <ButtonBase className={styles.modalBtn} onClick={this.handleBack}>Done</ButtonBase>
//                 </div>              
//                 :
//                 <ButtonBase className={styles.modalBtn} onClick={this.fillContainer}>Put on {container.ContainerNumber}</ButtonBase>
//               }
//               </div> :
//               <span style={{float: 'right'}}>Filling Container ...</span>
//             }
//           </div> 
//         }
//       </div>
//     );
//   }
// });

// const FillState = (state) => {
//   const {ids, containers, orders} = state.app.ordersPrepared;
//   const validIDs = ValidIDs(ids, orders, containers);
//   const container = _.find(state.app.containers.containers, (container) => (container.ContainerID == state.app.containers.active));
//   const trip = container.trip;
//   const {active, districts} = state.app.districts;
//   const isFilling = state.app.ordersPrepared.isFilling;
//   const validOrders = _.map(validIDs, (id) => {
//     const order = _.find(orders, (order) => (order.UserOrderNumber == id));
//     return {
//       id: order.WebOrderID,
//       id2: order.UserOrderNumber,
//       id3: order.UserOrderID,
//       pickup: order.PickupAddress.Address1,
//       dropoff: order.DropoffAddress.Address1,
//       time: (new Date(order.PickupTime)).toString(),
//       checked: order.checked,
//       status: order.status
//     }
//   });

//   return {
//     InvalidIDs: InvalidIDs(ids, orders),
//     HaveContainerIDs: HaveContainer(ids, containers),
//     ValidIDs: validIDs,
//     container: container,
//     districts: districts,
//     activeDistrict: _.find(districts, (district) => (district.DistrictID == container.district)) || {},
//     haveTried: _.find(orders, (order) => (order.status != '')),
//     validOrders: validOrders,
//     haveMore: _.filter(validOrders, (order) => {
//       return order.status != 'Success'
//     }),
//     isFilling: isFilling
//   }
// }

// const FillDispatch = (dispatch, ownProps) => {
//   return {
//     backToContainer: function(id) {
//       dispatch(push('/container/' + id));
//     },
//     orderToggle: function(id) {
//       dispatch(orderToggle(id));
//     },
//     districtsFetch: function() {
//       dispatch(districtsFetch());
//     },
//     pickDistrict: function(id1, id2) {
//       dispatch(containerDistrictPick(id1, id2));
//     },
//     resetDistrict: function(id) {
//       dispatch(containerDistrictReset(id));
//     },
//     fillContainer: function(containerNumber, ordersID, districtID) {
//       dispatch(containerFill(containerNumber, ordersID, districtID));
//     }
//   };
// }

// const FillContainer = connect(FillState, FillDispatch)(FillComponent);

// const FillPage = React.createClass({
//   render() {
//     const {backToContainer, container, showFetch} = this.props;
//     return (
//       <div>
//         <a href="javascript:;" onClick={backToContainer}>{'<<'} Back to Container Detail</a>
//         <div>
//           <PageTitle title={'Container ' + container.ContainerNumber} />
//           <FillContainer />
//         </div>
//       </div>
//     );
//   }
// });

// const mapStateToProps = (state, ownProps) => {
//   const {containers, ordersPrepared} = state.app;
//   const container = _.find(containers.containers, (container) => (container.ContainerID == containers.active));
//   const {isFetching, isValid, error, ids} = ordersPrepared;
//   return {
//     container: container
//   }
// }

// const mapDispatchToProps = (dispatch, ownProps) => {
//   return {
//     backToContainer: function() {
//       dispatch(push('/container/' + ownProps.params.id));
//     }
//   }
// }

// export default connect(mapStateToProps, mapDispatchToProps)(FillPage);

function PrepareOrder(order) {
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

const FillForm = React.createClass({
  componentDidMount() {
    const {limit, currentPage} = this.props.ordersPrepared;
    this.props.ordersPrepareFetch(limit, (currentPage-1)*limit);
  },
  getInitialState() {
    return {opened: false, showModal: false};
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
  closeModal() {
    this.setState({showModal: false});
    const {limit, currentPage} = this.props.ordersPrepared;
    this.props.ordersPrepareFetch(limit, (currentPage-1)*limit);
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
  putEverything() {
    confirm('Are you sure you want to put everything?');
  },
  fillContainer() {
    const {container, activeDistrict, ordersPrepared, fillContainer} = this.props;
    const orders = _.chain(ordersPrepared.orders).filter((order) => (order.checked)).map((order) => (order.UserOrderID)).value();
    fillContainer(container.ContainerNumber, orders, activeDistrict.DistrictID);
    this.setState({showModal: true});
  },
  putEverything() {
    const {container, activeDistrict, ordersPrepared, fillEverything} = this.props;
    fillEverything(container.ContainerNumber, ordersPrepared.ids, activeDistrict.DistrictID);
    this.setState({showModal: true});
  },
  render() {
    const {activeDistrict, districts, ordersPrepared} = this.props;
    const isFetching = ordersPrepared.isFetching;
    const isFilling = ordersPrepared.isFilling;
    const orders = _.map(ordersPrepared.orders, (order) => (PrepareOrder(order)));
    const {limit, currentPage} = ordersPrepared;
    const districtsName = _.map(districts, (district) => (district.Name));

    let successRes = [], failedRes = [];
    if(ordersPrepared.results) {
      successRes = _.filter(ordersPrepared.results.result, (res) => (res.status == 'Success'));
      failedRes = _.filter(ordersPrepared.results.result, (res) => (res.status == 'Failed'));
      console.log(successRes);
    }

    return (
      <div>
        <Modal show={ordersPrepared.results && this.state.showModal} width={700}>
          <h4 style={{marginTop: 0}}>Filling Results</h4>
          <div style={{marginBottom: 20}}>
            <span>Successfully put into container: ({successRes.length} items)</span>
            <div>{_.map(successRes, (res) => (res.orderNumber)).join(' ')}</div>
          </div>
          <div>
            <span>Failed to put into container: ({failedRes.length} items)</span>
            <div>{_.map(failedRes, (res) => (res.orderNumber)).join(' ')}</div>
          </div>
          <ButtonBase className={styles.modalBtn} onClick={this.closeModal}>OK</ButtonBase>
        </Modal>
        <Filter limit={limit} />
        {
          isFilling ? 
          <span style={{float: 'right'}}>Filling Container...</span> :
          <span>
            <ButtonBase className={styles.modalBtn} onClick={this.fillContainer}>{'Fill Container with Selected Orders'}</ButtonBase>
            <ButtonBase className={styles.modalBtn} onClick={this.putEverything}>{'Put Every Order into Container'}</ButtonBase>
          </span>
        }
        <span>Districts :</span>
        <Dropdown opened={this.state.opened} val={activeDistrict.Name} options={districtsName} onClick={this.toggleOpened} selectVal={this.selectDistrict} width={'150px'} />
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
  },
  handleBack() {
    const {container} = this.props;
    this.props.backToContainer(container.ContainerID);
  },
  render() {
    const {activeDistrict, backToContainer, container, districts, fillContainer, fillEverything, isFetchingContainer, isFetchingOrders, ordersPrepared, ordersPrepareFetch, orderToggle, orderToggleAll, ordersPrepareLimit, ordersPrepareCurrentPage, pickDistrict} = this.props;

    return (
      <div style={{paddingBottom: 200}}>
        <a href="javascript:;" onClick={backToContainer}>{'<<'} Back to Container Detail</a>
        {
          isFetchingContainer ?
          <span><br/>Fetching container data...</span> :
          <div>
            <PageTitle title={'Container ' + container.ContainerNumber} />
            <FillForm isFetchingOrders={isFetchingOrders} ordersPrepared={ordersPrepared} ordersPrepareFetch={ordersPrepareFetch} orderToggle={orderToggle} ordersPrepareLimit={ordersPrepareLimit} ordersPrepareCurrentPage={ordersPrepareCurrentPage} activeDistrict={activeDistrict} districts={districts} container={container} pickDistrict={pickDistrict} fillContainer={fillContainer} orderToggleAll={orderToggleAll} fillEverything={fillEverything}/>
          </div>
        }
      </div>
    );
  }
});

const mapStateToProps = (state, ownProps) => {
  const {containers, ordersPrepared} = state.app;
  const container = containers.containers[containers.active];

  if(!container) return { isFetchingContainer: true, container: {} };
  const {districts} = state.app.districts;

  return {
    container: container,
    isFetchingContainer: container.isFetching,
    ordersPrepared: ordersPrepared,
    activeDistrict: _.find(districts, (district) => (district.DistrictID == container.district)) || {},
    districts: districts
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    backToContainer: function() {
      dispatch(push('/container/' + ownProps.params.id));
    },
    containerDetailsFetch: function() {
      dispatch(containerDetailsFetch(ownProps.params.id));
    },
    ordersPrepareFetch: function(limit, offset) {
      dispatch(ordersPrepare(limit, offset));
    },
    orderToggle: function(id) {
      dispatch(orderToggle(id));
    },
    orderToggleAll: function(val) {
      dispatch(orderToggleAll(val));
    },
    ordersPrepareCurrentPage: function(val) {
      dispatch(ordersPrepareCurrentPage(val));
    },
    ordersPrepareLimit: function(val) {
      dispatch(ordersPrepareLimit(val));
    },
    pickDistrict: function(id1, id2) {
      dispatch(containerDistrictPick(id1, id2));
    },
    resetDistrict: function(id) {
      dispatch(containerDistrictReset(id));
    },
    districtsFetch: function() {
      dispatch(districtsFetch());
    },
    fillContainer: function(containerNumber, ordersID, districtID) {
      dispatch(containerFill(containerNumber, ordersID, districtID));
    },
    fillEverything: function(containerNumber, ordersID, districtID) {
      dispatch(containerFillEverything(containerNumber, ordersID, districtID));
    },
    ordersPrepareIDs: function(ids) {
      dispatch(ordersPrepareIDs(ids));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FillComponent);
