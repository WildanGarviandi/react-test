import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Page} from '../components/page';
import {Pagination3} from '../components/pagination3';
import {ButtonWithLoading} from '../components/button';
import * as DriverService from './driverService';
import styles from './styles.css';
import stylesButton from '../components/button.css';

function StoreBuilder(keyword) {
  return (store) => {
    const {filters} = store.app.myDrivers;

    return {
      value: filters[keyword],
    }
  }    
}

function DispatchBuilder(keyword, placeholder) {
  return (dispatch) => {
    function OnChange(e) {
      const newFilters = {[keyword]: e.target.value};
      dispatch(DriverService.UpdateFilters(newFilters));
    }

    function OnKeyDown(e) {
      if(e.keyCode !== 13) {
        return;
      }

      dispatch(DriverService.SetCurrentPage(1));
      dispatch(DriverService.FetchList());
    }

    return {
      onChange: OnChange, 
      onKeyDown: OnKeyDown,
      placeholder: placeholder
    }
  }
}

function ConnectBuilder(keyword, placeholder) {
    return connect(StoreBuilder(keyword), DispatchBuilder(keyword, placeholder));
}

function InputFilter({value, onChange, onKeyDown, placeholder}) {
  return (
    <div>
      <input className={styles.inputDriverSearch} placeholder={placeholder} type="text" value={value} onChange={onChange} onKeyDown={onKeyDown} />
    </div>
  );
}

const NameFilter = ConnectBuilder('name', 'Search Driver...')(InputFilter);

const Drivers = React.createClass({
  render: function() {
    var driverComponents = this.props.drivers.map(function(driver, idx) {
      return (
        <div className={styles.mainDriver} key={idx}>
          <div className={styles.tripDriver}>
            <div className={styles.vehicleIcon}>
              <img className={styles.driverLoadImage} 
                src={driver.Vehicle && driver.Vehicle.VehicleID === 1 ? "/img/icon-vehicle-motor.png" : "/img/icon-vehicle-van.png"} />
            </div>
            <div className={styles.driverDetails}>
              <span className={styles.driverName}>
                {driver.FirstName + ' ' + driver.LastName} 
              </span>
            </div>
            <div className={styles.driverDetails}>
              <span className={styles.vendorLoad}>
                Number of orders : 6
              </span>
            </div>
          </div>
        </div>
      );
    }.bind(this));
    return <div>{driverComponents}</div>;
  }
});

const PanelDrivers = React.createClass({
  render() {
    return (
      <div className={styles.mainDriverPanel}>
        <div className={styles.driverTitle}>
          Driver List
        </div>
        <div className={styles.panelDriverSearch}>
          <NameFilter />
        </div>
        <div className={styles.panelDriverList}>
          <Drivers drivers={this.props.drivers} />
        </div>
        <Pagination3 {...this.props.paginationState} {...this.props.PaginationAction} />
      </div>
    );
  }
});

const DriverPage = React.createClass({
    componentWillMount() {
        this.props.FetchList()
    },
    render() {
        const {paginationState, PaginationAction, drivers} = this.props;
        return (
            <Page title="My Driver">
                <PanelDrivers drivers={drivers} paginationState={paginationState} PaginationAction={this.props.PaginationAction} />
            </Page>
        );
    }
});

function StoreToDriversPage(store) {
    const {currentPage, limit, total, drivers} = store.app.myDrivers;
    return {
        drivers: drivers,
        paginationState: {
            currentPage, limit, total,
        },
    }
}

function DispatchToDriversPage(dispatch) {
    return {
        FetchList: () => {
            dispatch(DriverService.FetchList());
        },
        PaginationAction: {
            setCurrentPage: (currentPage) => {
                dispatch(DriverService.SetCurrentPage(currentPage));
            },
            setLimit: (limit) => {
                dispatch(DriverService.SetLimit(limit));
            },
        }
    }
}

export default connect(StoreToDriversPage, DispatchToDriversPage)(DriverPage);