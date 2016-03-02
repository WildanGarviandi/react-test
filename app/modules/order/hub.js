import React from 'react';
import {ButtonBase, InputText, Modal, Pagination} from '../base';
import {CellForContainer, CellWithLink, CellWithNums, Tables, TableWithoutSearch} from './tables';
import styles from './styles.css';

const classnaming = require('classnames/bind').bind(styles);

let orders = [
  {
    id: 'EDS37289643',
    pickup: 'Mesri Kota Bandung 40171',
    dropoff: 'test Kota Bandung 40243',
    pickup_time: new Date(),
    earnings: 13200,
    container: null
  },
  {
    id: 'EDS37289677',
    pickup: 'Stasiun Kota Bandung 40171',
    dropoff: 'You Know Where Kota Bandung 40243',
    pickup_time: new Date(),
    earnings: 77600,
    container: 'A1234'
  }
];

let columns = ['id', 'pickup', 'dropoff', 'pickup_time', 'earnings', 'container'];

let header = {
  id: 'Order ID', pickup: 'Pick Up', dropoff: 'Dropoff', pickup_time: 'Pick Up Time',
  earnings: 'Earnings', container: 'Containers', _sort: ['id', 'pickup', 'dropoff', 'pickup_time', 'earnings']
};

let HubOrderTable = Tables(columns, {
  id: { comps: CellWithLink },
  earnings: {comps: CellWithNums},
  container: {comps: CellForContainer}
});

const ContainerModal = ({addPackage, changeModal, closeModal, isModalShown, modalShown, packages}) => {
  return (
    <Modal show={isModalShown} width={ modalShown == 'containerID' ? 250 : '90%'}>
      { 
        modalShown == 'containerID' ?
        <SetContainerIDModal closeModal={closeModal} changeModal={changeModal} /> :
        <AddItemToContainerModal addPackage={addPackage} packages={packages} closeModal={closeModal} changeModal={changeModal} />
      }
    </Modal>
  );
}

const SetContainerIDModal = ({changeModal, closeModal}) => {
  return (
    <div>
      <h3>Set Container ID</h3>
      <hr/>
      <form>
        <label htmlFor="containerID">Container ID :</label>
        <InputText className={styles.modalInput} />
        <ButtonBase className={styles.modalBtn} type={'button'} onClick={changeModal.bind(null, 'addItem')}>Save</ButtonBase>
        <ButtonBase className={styles.modalBtn} type={'button'} onClick={closeModal}>Cancel</ButtonBase>
      </form>
    </div>
  );
}

const AddItemToContainerModal = ({addPackage, changeModal, packages, closeModal}) => {
  return (
    <div>
      <h3>Order for Container</h3>
      <hr/>
      <form>
        <label htmlFor="containerID">Order ID :</label>
        <InputText className={styles.modalInput} />
        <ButtonBase className={classnaming('modalBtn', 'addBtn')} type={'button'} onClick={addPackage}>Add</ButtonBase>
      </form>
      <TableWithoutSearch data={packages} header={header} />
      <form>
        <ButtonBase className={styles.modalBtn} type={'button'} onClick={closeModal}>Save</ButtonBase>
        <ButtonBase className={styles.modalBtn} type={'button'} onClick={closeModal}>Cancel</ButtonBase>
      </form>
    </div>
  );
}

const HubContainer = React.createClass({
  getInitialState() {
    return {currentPage: 1, limit: 10, orders: orders};
  },
  changeState(key) {
    return function(val) {
      var state = {};
      state[key] = val;
      this.setState(state);
    }.bind(this);
  },
  render() {
    let {pickContainer} = this.props;
    let {limit, currentPage, orders} = this.state;
    let {changeState} = this;

    return (
      <div>
        <ButtonBase className={styles.mainBtn} onClick={pickContainer}>Pick Container</ButtonBase>
        <h2 className={styles.contentTitle}>Order List</h2>
        <HubOrderTable data={orders} header={header} />
        <Pagination limit={limit} totalItem={orders.length} currentPage={currentPage} setLimit={changeState('limit')} setCurrentPage={changeState('currentPage')} />
      </div>
    );
  }
});

const HubPage = React.createClass({
  getInitialState() {
    return {isModalShown: false, modalShown: 'containerID', packages: []}
  },
  openModal() {
    this.setState({isModalShown: true, packages: [], modalShown: 'containerID'});
  },
  closeModal() {
    this.setState({isModalShown: false})
  },
  changeModal(val) {
    this.setState({modalShown: val});
  },
  addPackage() {
    let packages = this.state.packages;
    packages.push(orders[0]);
    this.setState({packages: packages});
  },
  render() {
    let {isModalShown, modalShown, packages} = this.state;
    let {openModal, closeModal, changeModal, addPackage} = this;

    return (
      <div>
        <HubContainer pickContainer={openModal} />
        <ContainerModal isModalShown={isModalShown} packages={packages} modalShown={modalShown} addPackage={addPackage} changeModal={changeModal} closeModal={closeModal}/>
      </div>
    );
  }
});

export default HubPage;
