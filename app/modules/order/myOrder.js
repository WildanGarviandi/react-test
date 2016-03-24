import React from 'react';
import {ButtonAtRightTop, ButtonBase, Modal, PageTitle, Pagination} from '../base';
import {CellWithCheckbox, CellWithNums, CellWithSelected, Tables} from './tables';
import styles from './styles.css';

let orders = [
  {
    id: 'EDS37289643',
    pickup: 'Mesri Kota Bandung 40171',
    dropoff: 'test Kota Bandung 40243',
    pickup_time: new Date(),
    earnings: 13200,
    driver: null,
    checked: false
  },
  {
    id: 'EDS37289677',
    pickup: 'Stasiun Kota Bandung 40171',
    dropoff: 'You Know Where Kota Bandung 40243',
    pickup_time: new Date(),
    earnings: 77600,
    driver: 'Uther Lightbringer',
    checked: false
  }
];

let columns = ['id', 'pickup', 'dropoff', 'pickup_time', 'earnings', 'driver'];

let header = {
  id: 'Order ID', pickup: 'Pick Up', dropoff: 'Dropoff', pickup_time: 'Pick Up Time',
  earnings: 'Earnings', driver: 'Driver', name: 'Name', phone: 'Phone', _sort: ['id', 'pickup', 'dropoff', 'pickup_time', 'earnings']
};

function ToggleChecked(obj) {
  obj.checked = !obj.checked;
  console.log('chec', obj.checked);
}

let MyOrderTable = Tables(columns, {
  id: { comps: CellWithCheckbox },
  earnings: {comps: CellWithNums}
});

let drivers = [
  { name: "Jaina Produmoore", phone: "081110191411"},
  { name: "Thrall", phone: "081220818112"},
  { name: "Grommash Hellscream", phone: "081371815131"}
];

let DriverTable = Tables(['name', 'phone'], {
  name: {comps: CellWithSelected},
  phone: {comps: CellWithSelected}
}, {withoutSearch: true});

const DriverModal = ({closeModal, isModalShown}) => {
  return (
    <Modal show={isModalShown}>
      <h2>Pick Driver</h2>
      <hr/>
      <DriverTable data={drivers} header={header} />
      <ButtonBase className={styles.modalBtn} type={'button'} onClick={closeModal}>Save</ButtonBase>
    </Modal>
  );
}

const MyOrderContainer = React.createClass({
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
    let {showModal} = this.props;
    let {limit, currentPage, orders} = this.state;
    let {changeState} = this;

    return (
      <div>
        <ButtonAtRightTop val={'Pick Driver'} onClick={showModal} />
        <PageTitle title={'Order List'} />
        <MyOrderTable data={orders} header={header} />
        <Pagination limit={limit} totalItem={orders.length} currentPage={currentPage} setLimit={changeState('limit')} setCurrentPage={changeState('currentPage')} />
      </div>
    );
  }
});

const MyOrderPage = React.createClass({
  getInitialState() {
    return {isModalShown: false}
  },
  showModal() {
    console.log(';');
    this.setState({isModalShown: true});
  },
  closeModal() {
    this.setState({isModalShown: false});
  },
  render() {
    let {isModalShown} = this.state;
    let {closeModal, showModal} = this;

    return (
      <div>
        <MyOrderContainer showModal={showModal} />
        <DriverModal isModalShown={isModalShown} closeModal={closeModal} />
      </div>
    );
  }
});

export default MyOrderPage;
