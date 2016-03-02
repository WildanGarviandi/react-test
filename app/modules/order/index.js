import React from 'react';
import _ from 'underscore';
import {ButtonBase, Dropdown, Glyph, Modal, Pagination} from '../base';
import {OrderTable} from './component';
import styles from './styles.css';

let orders = [
  {
    id: 'EDS37289643',
    pickup: 'Mesri Kota Bandung 40171',
    dropoff: 'test Kota Bandung 40243',
    pickup_time: new Date(),
    earnings: 13200
  },
  {
    id: 'EDS37289677',
    pickup: 'Stasiun Kota Bandung 40171',
    dropoff: 'You Know Where Kota Bandung 40243',
    pickup_time: new Date(),
    earnings: 77600
  }
];

let drivers = [
  { name: "Jaina Produmoore", phone: "081110191411"},
  { name: "Thrall", phone: "081220818112"},
  { name: "Grommash Hellscream", phone: "081371815131"}
]

const DriverComponent = React.createClass({
  handleClick() {
    let {idx, setSelected} = this.props;
    setSelected(idx);
  },
  render() {
    let {active, name, phone} = this.props;
    return (
      <li onClick={this.handleClick} className={styles.driverListItem}>
        <a className={styles.driver} href="javascript:;">
          <span className={active ? styles.glyphGreen : styles.glyphRed}>
            <Glyph name={active ? "check" : "unchecked"} />
          </span>
          <span>{name} - {phone}</span>
        </a>
      </li>
    );
  }
});

const DriverList = React.createClass({
  getInitialState() {
    return {
      selectedIdx: -1
    }
  },
  setSelected(idx) {
    this.setState({selectedIdx: idx});
  },
  render() {
    let driversComp = _.map(drivers, (driver, idx) => {
      return <DriverComponent setSelected={this.setSelected} idx={idx} active={idx == this.state.selectedIdx} key={driver.name} name={driver.name} phone={driver.phone} />
    });

    return (
      <div>
        <h3 style={{marginTop: 0}}>Pick Driver</h3>
        <ul className={styles.driverList}>
          {driversComp}
          <li style={{clear:"both"}} />
        </ul>
        <ButtonBase className={styles.assignBtn} onClick={this.props.hideModal}>Assign</ButtonBase>
      </div>
    );
  }
});

const MyOrderComponent = React.createClass({
  getInitialState() {
    return {showModal: false}
  },
  showModal() {
    this.setState({showModal: true});
  },
  hideModal() {
    this.setState({showModal: false});
  },
  render() {
    return (
      <div>
        <ButtonBase className={styles.dealWithDriver} onClick={this.showModal}>Set Driver</ButtonBase>
        <h2 className={styles.contentTitle}>Order List</h2>
        <OrderTable data={orders}/>
        <Pagination limit={10} totalItem={23} currentPage={1} />
        <Modal show={this.state.showModal} width={"700px"}>
          <div style={{height: "100px"}}>
            <DriverList hideModal={this.hideModal} />
          </div>
        </Modal>
      </div>
    );
  }
});

const ContainerList = React.createClass({
  getInitialState() {
    return {
      selectedIdx: -1,
      opened: false,
      val: 'Container-001'
    }
  },
  setSelected(idx) {
    this.setState({selectedIdx: idx});
  },
  toggleOpened() {
    this.setState({opened: !this.state.opened});
  },
  selectVal(x) {
    this.setState({val: x});
  },
  render() {
    let driversComp = _.map(drivers, (driver, idx) => {
      return <DriverComponent setSelected={this.setSelected} idx={idx} active={idx == this.state.selectedIdx} key={driver.name} name={driver.name} phone={driver.phone} />
    });

    return (
      <div style={{fontSize: "13px"}}>
        <h3 style={{marginTop: 0}}>Pick Container</h3>
        <label>Container ID : </label>
        <Dropdown className={styles.dropdown} options={['Container-001', 'Container-002']} val={this.state.val} opened={this.state.opened} onClick={this.toggleOpened} selectVal={this.selectVal} />
        <div>
          <ButtonBase className={styles.sealBtn} onClick={this.props.hideModal}>Seal</ButtonBase>
        </div>
      </div>
    );
  }
});

const HubComponent = React.createClass({
  getInitialState() {
    return {showModal: false}
  },
  showModal() {
    this.setState({showModal: true});
  },
  hideModal() {
    this.setState({showModal: false});
  },
  render() {
    return (
      <div>
        <ButtonBase className={styles.consolidate} onClick={this.showModal}>Consolidate</ButtonBase>
        <h2 className={styles.contentTitle}>Order List</h2>
        <OrderTable data={orders}/>
        <Pagination limit={10} totalItem={23} currentPage={1} />
        <Modal show={this.state.showModal} width={"210px"}>
          <div>
            <ContainerList hideModal={this.hideModal} />
          </div>
        </Modal>
      </div>
    );
  }
});

export {HubComponent as HubPage, MyOrderComponent as MyOrderPage};
