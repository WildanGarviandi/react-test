import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {containersFetch, districtsFetch, fillContainer, pagedOrdersFetch, pagedOrdersLimit, pagedOrdersPage, pickContainer, pickDistrict, selectedOrdersFetch, selectedOrdersToggle} from '../../actions';

import {ButtonAtRightTop, ButtonBase, Dropdown, InputText, Modal, PageTitle, Pagination} from '../base';
import {CellForContainer, CellWithCheckbox, CellWithLink, CellWithNums, CellWithStatus, Tables, TableWithoutSearch} from './tables';
import styles from './styles.css';

const classnaming = require('classnames/bind').bind(styles);

let columns = ['id', 'id2', 'pickup', 'dropoff', 'pickup_time', 'container'];

let header = {
  id: 'Web Order ID', id2: 'User Order Number', pickup: 'Pick Up', dropoff: 'Dropoff', pickup_time: 'Pick Up Time',
  earnings: 'Earnings', container: 'Containers', _sort: ['id', 'pickup', 'dropoff', 'pickup_time', 'earnings']
};

let HubOrderTable = Tables(columns, {
  id: { comps: CellWithLink },
  earnings: {comps: CellWithNums},
  container: {comps: CellForContainer}
});

let FillTable = Tables(columns, {
  id: { comps: CellWithCheckbox },
  container: { comps: CellWithStatus }
}, { withoutSearch: true, checked: true });

const ContainerModal = ({activeContainer, activeDistrict, changeModal, closeModal, containers, districts, fetchSelectedOrders, fillContainer, fillStatus, isModalShown, modalShown, packages, pickContainer, pickDistrict, selectedOrdersToggle}) => {
  return (
    <Modal show={isModalShown} width={ modalShown == 'containerID' ? 250 : '90%'}>
      { 
        modalShown == 'containerID' ?
        <SetContainerIDModal activeContainer={activeContainer} fetchSelectedOrders={fetchSelectedOrders} containers={containers} closeModal={closeModal} changeModal={changeModal} pickContainer={pickContainer} /> :
        <AddItemToContainerModal activeContainer={activeContainer} packages={packages} closeModal={closeModal} changeModal={changeModal} districts={districts} pickDistrict={pickDistrict} activeDistrict={activeDistrict} fillContainer={fillContainer} fillStatus={fillStatus} selectedOrdersToggle={selectedOrdersToggle}/>
      }
    </Modal>
  );
}

const SetContainerIDModal = React.createClass({
  getInitialState() {
    return {opened: false, IDs: ''};
  },
  toggleOpened() {
    this.setState({opened: !this.state.opened});
  },
  selectContainers(val) {
    this.setState({opened: false});
    this.props.pickContainer(val);
  },
  handleChangeModal() {
    let IDs = this.state.IDs.split('\n');
    IDs = _.map(IDs, function(ID) {
      return ID.trim();
    });
    IDs = _.filter(IDs, function(ID) {
      return ID.length > 0;
    });
    IDs = _.uniq(IDs);

    this.props.fetchSelectedOrders(IDs);
    this.props.changeModal('addItem');
  },
  changeText(e) {
    this.setState({IDs: e.target.value});
  },
  render() {
    let {changeModal, closeModal, containers} = this.props;
    return (
      <div>
        <h3>Set Container ID</h3>
        <hr/>
        <form action="javascript:;">
          <label htmlFor="containerID">Container ID :</label>
          <Dropdown opened={this.state.opened} val={this.props.activeContainer} options={containers} onClick={this.toggleOpened} selectVal={this.selectContainers} width={'130px'} />
          <br/>
          <label htmlFor="containerID">Orders ID :</label>
          <div>
            <textarea style={{height: 100, width: '100%'}} value={this.state.IDs} onChange={this.changeText}/>
          </div>
          <ButtonBase className={styles.modalBtn} type={'submit'} onClick={this.handleChangeModal}>Save</ButtonBase>
          <ButtonBase className={styles.modalBtn} type={'button'} onClick={closeModal}>Cancel</ButtonBase>
        </form>
      </div>
    );
  }
});

const AddItemToContainerModal = React.createClass({
  getInitialState() {
    return {
      opened: false
    };
  },
  toggleOpened() {
    this.setState({opened: !this.state.opened});
  },
  toggleChecked(val) {
    console.log('v', val);
    let selected = _.find(this.props.packages, (order) => (order.id2 == val.id2));
    this.props.selectedOrdersToggle(selected.id2);
  },
  selectDistrict(val) {
    this.setState({opened: false});
    let selectedDistrict = _.find(this.props.districts, (district) => (district.Name == val));
    this.props.pickDistrict(selectedDistrict.DistrictID);
  },
  fillContainer() {
    let ordersID = _.map(_.filter(this.props.packages, (order) => (order.checked)), (order) => (order.id3));
    console.log('fc', this.props.activeDistrict, this.props.activeContainer, ordersID);
    this.props.fillContainer(this.props.activeContainer, ordersID, this.props.activeDistrict);
  },
  render() {
    let {activeContainer, activeDistrict, changeModal, districts, closeModal, fillStatus, packages} = this.props;
    let districtsName = _.map(districts, (district) => (district.Name));
    let selectedDistrict = _.find(this.props.districts, (district) => (district.DistrictID == activeDistrict));
    let selectedName = selectedDistrict ? selectedDistrict.Name : '';

    return (
      <div>
        <h3>Order for Container {activeContainer}</h3>
        <hr/>
        <span style={{marginBottom: '10px', display: 'inline-block'}}>District: </span>
        <Dropdown opened={this.state.opened} val={selectedName} options={districtsName} onClick={this.toggleOpened} selectVal={this.selectDistrict} width={'150px'} />
        <span style={{float: 'right', color: 'red'}}>
          {!fillStatus.isFilling && !fillStatus.isValid ? 
            fillStatus.error : ''}
        </span>
        <div style={ fillStatus.isFilling ? {opacity: 0.5} : {}}>
          <FillTable data={packages} header={header} rowClicked={this.toggleChecked} />
        </div>
        <form>
          <ButtonBase className={styles.modalBtn} type={'button'} onClick={this.fillContainer}>Save</ButtonBase>
          <ButtonBase className={styles.modalBtn} type={'button'} onClick={closeModal}>Cancel</ButtonBase>
        </form>
      </div>
    );
  }
});

const HubContainer = React.createClass({
  changeState(key) {
    return function(val) {
      var state = {};
      state[key] = val;
      this.setState(state);
    }.bind(this);
  },
  render() {
    let {currentPage, limit, orders, pickContainer, setLimit, setPage, totalItem} = this.props;

    return (
      <div>
        <ButtonAtRightTop val={'Pick Container'} onClick={pickContainer} />
        <PageTitle title={'Order List'} />
        <HubOrderTable data={orders} header={header} />
        <Pagination limit={limit} totalItem={totalItem} currentPage={currentPage} setLimit={setLimit} setCurrentPage={setPage} />
      </div>
    );
  }
});

const HubPage = React.createClass({
  getInitialState() {
    return {isModalShown: false, modalShown: 'containerID'}
  },
  componentDidMount() {
    this.props.fetchOrders();
    // this.props.getContainers();
    // this.props.districtsFetch();
  },
  openModal() {
    this.setState({isModalShown: true, modalShown: 'containerID'});
  },
  closeModal() {
    this.setState({isModalShown: false})
  },
  changeModal(val) {
    this.setState({modalShown: val});
  },
  render() {
    let {openModal, closeModal, changeModal} = this;
    let {activeContainer, activeDistrict, containers, currentPage, districts, fetchSelectedOrders, fillContainer, fillStatus, limit, orders, packages, pickContainer, pickDistrict, selectedOrdersToggle, setLimit, setPage, totalItem} = this.props;
    let {isModalShown, modalShown} = this.state;

    return (
      <div>
        <HubContainer pickContainer={openModal} orders={orders} limit={limit} currentPage={currentPage} setLimit={setLimit} setPage={setPage} totalItem={totalItem} />
        <ContainerModal containers={containers} fetchSelectedOrders={fetchSelectedOrders} isModalShown={isModalShown} packages={packages} modalShown={modalShown} changeModal={changeModal} closeModal={closeModal} pickContainer={pickContainer} activeContainer={activeContainer} districts={districts} pickDistrict={pickDistrict} activeDistrict={activeDistrict} fillContainer={fillContainer} fillStatus={fillStatus} selectedOrdersToggle={selectedOrdersToggle}/>
      </div>
    );
  }
});

const mapStateToProps = (state) => {
  const {containers, active} = state.app.containers;
  const {limit, orders, page, total} = state.app.pagedOrders;
  const selectedOrders = state.app.selectedOrders.orders;
  const {districts} = state.app.districts;
  const activeDistrict = state.app.districts.active;
  const {isFilling, isValid, error} = state.app.fillContainer;
  const fillStatus = {isFilling, isValid, error};

  return {
    orders: _.map(orders, (newOrder) => {
      let order = newOrder.order;
      return {
        id: order.WebOrderID,
        id2: order.UserOrderNumber,
        pickup: order.PickupAddress.Address1,
        dropoff: order.DropoffAddress.Address1,
        pickup_time: new Date(order.PickupTime),
        container: newOrder.container,
      }
    }),
    limit: limit,
    currentPage: page,
    totalItem: total,
    containers: _.map(containers, (container) => {
      return container.ContainerNumber;
    }),
    activeContainer: active,
    activeDistrict: activeDistrict,
    packages: _.map(selectedOrders, (order) => {
      return {
        id: order.WebOrderID,
        id2: order.UserOrderNumber,
        pickup: order.PickupAddress.Address1,
        dropoff: order.DropoffAddress.Address1,
        pickup_time: new Date(order.PickupTime),
        container: order.containerNumber,
        status: order.status,
        checked: order.checked,
        id3: order.UserOrderID
      }
    }),
    districts: districts,
    fillStatus: fillStatus
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchOrders: function() {
      dispatch(pagedOrdersFetch())
    },
    setLimit: function(limit) {
      dispatch(pagedOrdersLimit(limit));
    },
    setPage: function(page) {
      console.log('!');
      dispatch(pagedOrdersPage(page));
    },
    getContainers: function() {
      dispatch(containersFetch());
    },
    fetchSelectedOrders: function(ordersID) {
      dispatch(selectedOrdersFetch(ordersID));
    },
    pickContainer: function(containerNumber) {
      dispatch(pickContainer(containerNumber));
    },
    pickDistrict: function(districtID) {
      console.log('di', districtID);
      dispatch(pickDistrict(districtID));
    },
    districtsFetch: function() {
      dispatch(districtsFetch());
    },
    fillContainer: function(containerNumber, ordersID, districtID) {
      dispatch(fillContainer(containerNumber, ordersID, districtID));
    },
    selectedOrdersToggle: function(ID) {
      dispatch(selectedOrdersToggle(ID));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HubPage);
