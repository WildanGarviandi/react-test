import React from 'react';
import { connect } from 'react-redux';
import Countdown from 'react-cntdwn';
import NumberFormat from 'react-number-format';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';
import { Link } from 'react-router';

import lodash from 'lodash';
import moment from 'moment';

import { Page } from '../components/page';
import { Pagination3 } from '../components/pagination3';
import { ButtonWithLoading } from '../components/Button';
import * as DriverService from './driverService';
import styles from './styles.scss';
import stylesButton from '../components/Button/styles.scss';
import config from '../config/configValues.json';
import { InputWithDefault } from '../views/base/input';
import * as Form from '../components/form';
import ImagePreview from '../views/base/imagePreview';
import ImageUploader from '../views/base/imageUploader';
import * as UtilHelper from '../helper/utility';
import EllipsisMenu from './components/EllipsisMenu';
import Confirmation from '../components/Confirmation';

const DEFAULT_IMAGE = '/img/photo-default.png';

function StoreBuilder(keyword) {
  return store => {
    const { filters } = store.app.myDrivers;

    return {
      value: filters[keyword],
    };
  };
}

function DispatchBuilder(keyword, placeholder) {
  return dispatch => {
    function OnChange(e) {
      const newFilters = { [keyword]: e.target.value };
      dispatch(DriverService.UpdateFilters(newFilters));
    }

    function OnKeyDown(e) {
      if (e.keyCode !== 13) {
        return;
      }

      dispatch(DriverService.SetCurrentPage(1));
      dispatch(DriverService.FetchList());
    }

    return {
      onChange: OnChange,
      onKeyDown: OnKeyDown,
      placeholder,
    };
  };
}

function ConnectBuilder(keyword, placeholder) {
  return connect(StoreBuilder(keyword), DispatchBuilder(keyword, placeholder));
}

function InputFilter({ value, onChange, onKeyDown, placeholder }) {
  return (
    <div>
      <input
        className={styles.inputDriverSearch}
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}

const NameFilter = ConnectBuilder('name', 'Search Driver...')(InputFilter);

const Drivers = React.createClass({
  render: function() {
    var driverComponents = this.props.drivers.map(
      function(driver, idx) {
        const driverStyle =
          parseInt(driver.UserID) ===
          parseInt(this.props.driver && this.props.driver.UserID)
            ? styles.tripDriverSelected
            : styles.tripDriver;
        return (
          <div
            className={styles.mainDriver}
            key={idx}
            onClick={() => {
              this.props.selectDriver(driver.UserID);
            }}
          >
            <div className={driverStyle}>
              <div className={styles.vehicleIcon}>
                <img
                  className={styles.driverLoadImage}
                  src={driver.ProfilePicture || DEFAULT_IMAGE}
                  onError={e => {
                    e.target.src = DEFAULT_IMAGE;
                  }}
                />
              </div>
              <div className={styles.driverDetails}>
                <span className={styles.driverName}>
                  {UtilHelper.trimString(
                    driver.FirstName + ' ' + driver.LastName,
                    20
                  )}
                </span>
              </div>
              <div className={styles.driverDetails}>
                <span className={styles.vendorLoad}>
                  Number of orders : {driver.TotalOrders}
                </span>
              </div>
            </div>
          </div>
        );
      }.bind(this)
    );
    return (
      <div>
        {driverComponents}
      </div>
    );
  },
});

const PanelDrivers = React.createClass({
  getInitialState() {
    return {
      showAddModals: false,
      ProfilePicture: DEFAULT_IMAGE,
    };
  },
  addDriverModal() {
    this.setState({
      showAddModals: true,
    });
  },
  closeModal() {
    this.setState({
      showAddModals: false,
      ProfilePicture: DEFAULT_IMAGE,
    });
  },
  stateChange(key) {
    return value => {
      this.setState({ [key]: value });
      if (typeof value === 'object') {
        this.setState({ [key]: value.key });
      }
    };
  },
  setPicture(url) {
    this.setState({
      ProfilePicture: url,
    });
  },
  addDriver() {
    const mandatoryFields = [
      'FirstName',
      'LastName',
      'PhoneNumber',
      'Email',
      'Location',
      'StateID',
      'ZipCode',
      'PackageSizeID',
      'Password',
    ];
    const filledFields = Object.keys(this.state);
    const unfilledFields = lodash.difference(mandatoryFields, filledFields);
    if (unfilledFields.length > 0) {
      alert('Missing ' + unfilledFields.join());
      return;
    }
    let addedData = lodash.assign({}, this.state);
    delete addedData.showAddModals;
    this.props.addDriver(addedData);
  },
  render() {
    const addButton = {
      textBase: '+ Add',
      onClick: this.addDriverModal,
      styles: {
        base: stylesButton.whiteButton,
      },
    };
    const submitButton = {
      textBase: 'Add New Driver',
      onClick: this.addDriver,
      styles: {
        base: stylesButton.blueButton,
      },
    };
    const vehicleOptions = config.vehicle;
    const stateOptions = lodash
      .chain(this.props.stateList)
      .map((key, val) => ({ key, value: val.toUpperCase() }))
      .sortBy(arr => arr.key)
      .value();
    return (
      <div className={styles.mainDriverPanel}>
        <div className={styles.driverTitle}>
          Driver List
          <ButtonWithLoading {...addButton} />
          <Link to="/driverMap" className={styles['map-button']}>
            <img src={config.IMAGES.ICON_MAP} alt="map" />
            <span>Map</span>
          </Link>
        </div>
        <div className={styles.panelDriverSearch}>
          <NameFilter />
        </div>
        {this.props.drivers.length > 0 &&
          <div className={styles.panelDriverList}>
            <Drivers
              drivers={this.props.drivers}
              driver={this.props.driver}
              selectDriver={this.props.selectDriver}
            />
          </div>}
        {this.props.drivers.length === 0 &&
          <div className={styles.noDriverDesc}>
            <img src={'/img/icon-no-driver.png'} />
            <br />
            <span style={{ fontWeight: 'bold', lineHeight: 2.5 }}>
              You haven’t add any driver yet!
            </span>
            <br />
            <span style={{ opacity: 0.5 }}>
              You can add a diver by tapping the "+add" button above.
            </span>
          </div>}
        <Pagination3
          {...this.props.paginationState}
          {...this.props.PaginationAction}
        />
        {this.state.showAddModals &&
          <ModalContainer>
            <ModalDialog>
              <div>
                <div className={styles.modalTitle}>Add Driver</div>
                <div onClick={this.closeModal} className={styles.modalClose}>
                  X
                </div>
                <div className={styles.topDescDetails}>
                  <div className={styles.driverDetailsMain}>
                    <div className={styles.driverDetailsPicture}>
                      <ImageUploader
                        withImagePreview={true}
                        currentImageUrl={this.state.ProfilePicture}
                        updateImageUrl={data => this.setPicture(data)}
                      />
                    </div>
                    <div className={styles.driverDetailsName}>
                      <RowDetails
                        onChange={this.stateChange('FirstName')}
                        label={'First Name'}
                        isEditing={true}
                      />
                      <RowDetails
                        onChange={this.stateChange('LastName')}
                        label={'Last Name'}
                        isEditing={true}
                      />
                    </div>
                  </div>
                  <div className={styles.driverDetailsSecondary}>
                    <RowDetails
                      onChange={this.stateChange('Email')}
                      label={'Email'}
                      isEditing={true}
                    />
                    <RowDetails
                      onChange={this.stateChange('PhoneNumber')}
                      label={'Phone Number'}
                      isEditing={true}
                    />
                    <RowDetails
                      onChange={this.stateChange('Location')}
                      label={'Address'}
                      isEditing={true}
                    />
                  </div>
                  <div className={styles.driverDetailsMain2}>
                    <div className={styles.driverDetailsPicture}>
                      <RowDetailsDropdown
                        label={'State'}
                        options={stateOptions}
                        handleSelect={this.stateChange('StateID')}
                        isEditing={true}
                      />
                    </div>
                    <div className={styles.driverDetailsName}>
                      <RowDetails
                        onChange={this.stateChange('ZipCode')}
                        label={'Zipcode'}
                        isEditing={true}
                      />
                    </div>
                  </div>
                  <div className={styles.driverDetailsSecondary}>
                    <RowDetailsDropdown
                      label={'Vehicle'}
                      options={vehicleOptions}
                      handleSelect={this.stateChange('PackageSizeID')}
                      isEditing={true}
                    />
                    <div style={{ clear: 'both' }} />
                    <RowDetails
                      onChange={this.stateChange('DrivingLicenseID')}
                      label={'License Number'}
                      isEditing={true}
                    />
                    <RowDetails
                      onChange={this.stateChange('Password')}
                      type={'password'}
                      label={'Password'}
                      isEditing={true}
                    />
                  </div>
                  <div className={styles.updateButton}>
                    <ButtonWithLoading {...submitButton} />
                  </div>
                  <div style={{ clear: 'both' }} />
                </div>
              </div>
            </ModalDialog>
          </ModalContainer>}
      </div>
    );
  },
});

const RowDetails = React.createClass({
  render() {
    const { isEditing, value, label, onChange, type } = this.props;
    return (
      <div>
        <div className={styles.driverDetailsLabel}>
          {label}
        </div>
        <div className={styles.driverDetailsValue}>
          {isEditing &&
            <span>
              <InputWithDefault
                type={type || 'text'}
                className={styles.inputDetails}
                currentText={value}
                onChange={onChange}
              />
            </span>}
          {!isEditing &&
            <span>
              {value}
            </span>}
        </div>
      </div>
    );
  },
});

const RowDetailsDropdown = React.createClass({
  render() {
    const { isEditing, value, label, handleSelect, options } = this.props;
    return (
      <div>
        <div className={styles.driverDetailsLabel}>
          {label}
        </div>
        <div className={styles.driverDetailsValue}>
          {isEditing &&
            <span>
              <Form.DropdownWithState3
                initialValue={value}
                options={options}
                handleSelect={handleSelect}
              />
            </span>}
          {!isEditing &&
            <span>
              {value}
            </span>}
        </div>
      </div>
    );
  },
});

const PanelDriversDetails = React.createClass({
  getInitialState() {
    return {
      isEditing: false,
      deleteConfirmation: false,
    };
  },
  stateChange(key) {
    return value => {
      this.setState({ [key]: value });
      if (typeof value === 'object') {
        this.setState({ [key]: value.key });
      }
    };
  },
  componentWillReceiveProps(nextProps) {
    this.setState({ isEditing: false });
    this.setState({
      ProfilePicture: nextProps.driver.ProfilePicture || DEFAULT_IMAGE,
    });
  },
  toggleEditDriver() {
    this.setState({
      isEditing: !this.state.isEditing,
    });
  },
  updateDriver() {
    const updatedData = lodash.assign({}, this.state);
    delete updatedData.isEditing;
    this.props.editDriver(this.props.driver.UserID, updatedData);
  },
  setPicture(url) {
    this.setState({
      ProfilePicture: url,
    });
  },
  handleSelect(menu) {
    if (menu.id === 'EDIT') {
      this.setState({
        isEditing: !this.state.isEditing,
      });
    }
    if (menu.id === 'DELETE') {
      const { PictureUrl } = this.props.driver;
      this.setState({
        deleteConfirmation: true,
      });
    }
  },
  hideDeleteConf() {
    this.setState({ deleteConfirmation: false });
  },
  deleteDriver() {
    this.props.deleteDriver(this.props.driver.UserID);
    this.hideDeleteConf();
  },
  getDeleteConfirmationProps() {
    const { PictureUrl, FirstName, LastName } = this.props.driver;
    const props = {
      closeModal: this.hideDeleteConf,
      modalStyles: styles['delete-conf__modal-style'],
      title: (
        <div>
          <p className={styles['delete-conf__title']}>
            Delete Driver Confirmation
          </p>
          <img
            src={PictureUrl}
            alt=""
            className={styles['delete-conf__picture']}
          />
          <p
            className={styles['delete-conf__driver-name']}
          >{`${FirstName} ${LastName}`}</p>
        </div>
      ),
      descStyles: styles['delete-conf__desc-style'],
      desc: 'Are you really sure want to delete this driver?',
      children: (
        <div>
          <button
            className={styles['delete-conf__no-btn']}
            onClick={this.hideDeleteConf}
          >
            No
          </button>
          <button
            className={styles['delete-conf__yes-btn']}
            onClick={this.deleteDriver}
          >
            Yes
          </button>
        </div>
      ),
    };

    return props;
  },
  render() {
    const { driver, stateList } = this.props;
    const updateButton = {
      textBase: 'Update Profile',
      onClick: this.updateDriver,
      styles: {
        base: stylesButton.greenButton3,
      },
    };
    const vehicleOptions = config.vehicle;
    const vehicleValue = lodash.find(vehicleOptions, {
      key: driver.PackageSizeMaster && driver.PackageSizeMaster.PackageSizeID,
    });
    const stateOptions = lodash
      .chain(stateList)
      .map((key, val) => ({ key, value: val.toUpperCase() }))
      .sortBy(arr => arr.key)
      .value();

    return (
      <div className={styles.mainDriverDetailsPanel}>
        {this.state.deleteConfirmation &&
          <Confirmation {...this.getDeleteConfirmationProps()} />}
        <div className={styles.driverTitle}>Driver Details</div>
        <div
          role="none"
          className={styles.driverEditButton}
          onClick={this.showMenu}
        >
          <span className={styles.ellipsisMenu} />
        </div>
        <EllipsisMenu
          handleSelect={this.handleSelect}
          isEditing={this.state.isEditing}
        />
        <div className={styles.driverDetailsMain}>
          <div className={styles.driverDetailsPicture}>
            {this.state.isEditing &&
              <ImageUploader
                withImagePreview={true}
                currentImageUrl={this.state.ProfilePicture}
                updateImageUrl={data => this.setPicture(data)}
              />}
            {!this.state.isEditing &&
              <ImagePreview imageUrl={this.state.ProfilePicture} />}
          </div>
          <div className={styles.driverDetailsName}>
            <RowDetails
              value={driver.FirstName}
              onChange={this.stateChange('FirstName')}
              label={'First Name'}
              isEditing={this.state.isEditing}
            />
            <RowDetails
              value={driver.LastName}
              onChange={this.stateChange('LastName')}
              label={'Last Name'}
              isEditing={this.state.isEditing}
            />
          </div>
        </div>
        <div className={styles.driverDetailsSecondary}>
          <RowDetails
            value={driver.Email}
            onChange={this.stateChange('Email')}
            label={'Email'}
            isEditing={this.state.isEditing}
          />
          <RowDetails
            value={driver.PhoneNumber}
            onChange={this.stateChange('PhoneNumber')}
            label={'Phone Number'}
            isEditing={this.state.isEditing}
          />
          <RowDetails
            value={driver.Location}
            onChange={this.stateChange('Location')}
            label={'Address'}
            isEditing={this.state.isEditing}
          />
        </div>
        <div className={styles.driverDetailsMain2}>
          <div className={styles.driverDetailsPicture}>
            <RowDetailsDropdown
              label={'State'}
              value={driver.State && driver.State.Name}
              options={stateOptions}
              handleSelect={this.stateChange('StateID')}
              isEditing={this.state.isEditing}
            />
          </div>
          <div className={styles.driverDetailsName}>
            <RowDetails
              value={driver.ZipCode}
              onChange={this.stateChange('ZipCode')}
              label={'Zipcode'}
              isEditing={this.state.isEditing}
            />
          </div>
        </div>
        <div className={styles.driverDetailsSecondary}>
          <RowDetailsDropdown
            label={'Vehicle'}
            value={vehicleValue && vehicleValue.value}
            options={vehicleOptions}
            handleSelect={this.stateChange('PackageSizeID')}
            isEditing={this.state.isEditing}
          />
          <div style={{ clear: 'both' }} />
          <RowDetails
            value={driver.DrivingLicenseID}
            onChange={this.stateChange('DrivingLicenseID')}
            label={'License Number'}
            isEditing={this.state.isEditing}
          />
        </div>
        {this.state.isEditing &&
          <div className={styles.updateButton}>
            <ButtonWithLoading {...updateButton} />
          </div>}
      </div>
    );
  },
});

const Deadline = React.createClass({
  render() {
    let format = {
      hour: 'hh',
      minute: 'mm',
      second: 'ss',
    };
    let Duration = moment.duration(
      moment(this.props.deadline).diff(moment(new Date()))
    );
    if (!this.props.deadline) {
      return <span style={{ color: 'black' }}>-</span>;
    } else if (Duration._milliseconds > config.deadline.day) {
      return (
        <span style={{ color: 'black' }}>
          {Duration.humanize()} remaining
        </span>
      );
    } else if (Duration._milliseconds < 0) {
      return <span style={{ color: 'red' }}>Passed</span>;
    } else {
      let normalDeadline =
        Duration._milliseconds > config.deadline['3hours'] &&
        Duration._milliseconds < config.deadline.day;
      return (
        <span style={{ color: normalDeadline ? 'black' : 'red' }}>
          <Countdown
            targetDate={new Date(this.props.deadline)}
            startDelay={500}
            interval={1000}
            format={format}
            timeSeparator={':'}
            leadingZero={true}
          />
        </span>
      );
    }
  },
});

const DriverOrders = React.createClass({
  render: function() {
    var orderComponents = this.props.orders.map(
      function(order, idx) {
        return (
          <div className={styles.mainOrder} key={idx}>
            <div className={styles.orderName}>
              <div className={styles.orderNum}>
                {order.UserOrderNumber}
                <br />
                {order.WebOrderID}
              </div>
              <div className={styles.orderEDS}>
                Deadline: <Deadline deadline={order.DueTime} />
              </div>
              {order.IsCOD && <div className={styles.orderCOD}>COD</div>}
            </div>
            <div style={{ clear: 'both' }} />
            <div>
              <div className={styles.orderDetailsLabel}>From</div>
              <div className={styles.orderDetailsValue}>
                {order.PickupAddress &&
                  order.PickupAddress.FirstName +
                    ' ' +
                    order.PickupAddress.LastName}
              </div>
              <div className={styles.orderDetailsValue2}>
                {order.PickupAddress && order.PickupAddress.Address1}
              </div>
              <div className={styles.orderDetailsLabel}>To</div>
              <div className={styles.orderDetailsValue}>
                {order.DropoffAddress &&
                  order.DropoffAddress.FirstName +
                    ' ' +
                    order.DropoffAddress.LastName}
              </div>
              <div className={styles.orderDetailsValue2}>
                {order.DropoffAddress && order.DropoffAddress.Address1}
              </div>
            </div>
          </div>
        );
      }.bind(this)
    );
    return (
      <div>
        {orderComponents}
      </div>
    );
  },
});

const PanelDriversOrders = React.createClass({
  render() {
    const { driver, orders, isFetchingOrders } = this.props;
    const weight = lodash.sumBy(orders, 'PackageWeight');
    const codOrders = lodash.filter(orders, order => order.IsCOD === true);
    const totalValue = _.reduce(
      orders,
      (total, order) => {
        return total + order.TotalValue;
      },
      0
    );
    const codTotalValue = _.reduce(
      codOrders,
      (total, order) => {
        return total + order.TotalValue;
      },
      0
    );
    return (
      <div className={styles.mainDriverOrdersPanel}>
        <div className={styles.driverTitle}>Driver Orders</div>
        {isFetchingOrders &&
          <div className={styles.orderDetails}>
            <img className={styles.loadingImage} src={'/img/loading.gif'} />
          </div>}
        {!isFetchingOrders &&
          <div>
            <div className={styles.orderDetails}>
              <div>
                <div className={styles.orderAdditionalInfo}>
                  <div className={styles.orderDetailsLabel}>Weight</div>
                  <div className={styles.orderDetailsValue}>
                    {parseFloat(weight).toFixed(2)} kg
                  </div>
                </div>
                <div className={styles.orderAdditionalInfo}>
                  <div className={styles.orderDetailsLabel}>COD Order</div>
                  <div className={styles.orderDetailsValue}>
                    {codOrders.length} items
                  </div>
                </div>
                <div className={styles.orderAdditionalInfo}>
                  <div className={styles.orderDetailsLabel}>COD Value</div>
                  <div className={styles.orderDetailsValue}>
                    <NumberFormat
                      displayType={'text'}
                      thousandSeparator={'.'}
                      decimalSeparator={','}
                      prefix={'Rp '}
                      value={codTotalValue}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.orderValue}>
              <div className={styles.orderValueLabel}>Total Value</div>
              <div className={styles.orderTotalValue}>
                <NumberFormat
                  displayType={'text'}
                  thousandSeparator={'.'}
                  decimalSeparator={','}
                  prefix={'Rp '}
                  value={totalValue}
                />
              </div>
            </div>
            <div>
              <div className={styles.driverNumOrders}>
                <div className={styles.numOrderLeft}>Number of orders:</div>
                <div className={styles.numOrderRight}>
                  {orders.length}
                </div>
              </div>
              <div className={styles.driverDetailsOrder}>
                <DriverOrders orders={orders} />
              </div>
            </div>
            <Pagination3
              {...this.props.paginationState}
              {...this.props.PaginationAction}
            />
          </div>}
      </div>
    );
  },
});

const DriverPage = React.createClass({
  componentWillMount() {
    this.props.FetchList();
    this.props.ResetDriver();
  },
  render() {
    const {
      paginationState,
      paginationStateOrders,
      PaginationAction,
      PaginationActionOrders,
      stateList,
      AddDriver,
      EditDriver,
      drivers,
      driver,
      orders,
      SelectDriver,
      isFetchingOrders,
      deleteDriver,
    } = this.props;
    return (
      <Page title="My Driver">
        <div className={styles.mainDriverPage}>
          <PanelDrivers
            drivers={drivers}
            driver={driver}
            stateList={stateList}
            addDriver={AddDriver}
            paginationState={paginationState}
            PaginationAction={PaginationAction}
            selectDriver={SelectDriver}
          />
          {lodash.isEmpty(driver) &&
            <div className={styles.clickDriverDesc}>
              Click on the driver to see their details and information.
            </div>}
          {!lodash.isEmpty(driver) &&
            <PanelDriversDetails
              driver={driver}
              stateList={stateList}
              editDriver={EditDriver}
              deleteDriver={deleteDriver}
            />}
          {!lodash.isEmpty(driver) &&
            <PanelDriversOrders
              driver={driver}
              isFetchingOrders={isFetchingOrders}
              orders={orders}
              paginationState={paginationStateOrders}
              PaginationAction={PaginationActionOrders}
            />}
        </div>
      </Page>
    );
  },
});

function StoreToDriversPage(store) {
  const {
    currentPage,
    currentPageOrders,
    limit,
    limitOrders,
    total,
    totalOrders,
    drivers,
    driver,
    orders,
    isFetchingOrders,
  } = store.app.myDrivers;
  const { states } = store.app.stateList;
  let stateList = {};
  states.forEach(function(state) {
    stateList[state.Name] = state.StateID;
  });
  return {
    drivers: drivers,
    paginationState: {
      currentPage,
      limit,
      total,
    },
    paginationStateOrders: {
      currentPage: currentPageOrders,
      limit: limitOrders,
      total: totalOrders,
    },
    driver: driver,
    orders: orders,
    stateList: stateList,
    isFetchingOrders: isFetchingOrders,
  };
}

function DispatchToDriversPage(dispatch) {
  return {
    FetchList: () => {
      dispatch(DriverService.FetchList());
    },
    PaginationAction: {
      setCurrentPage: currentPage => {
        dispatch(DriverService.SetCurrentPage(currentPage));
      },
      setLimit: limit => {
        dispatch(DriverService.SetLimit(limit));
      },
    },
    PaginationActionOrders: {
      setCurrentPage: currentPage => {
        dispatch(DriverService.SetCurrentPageOrders(currentPage));
      },
      setLimit: limit => {
        dispatch(DriverService.SetLimitOrders(limit));
      },
    },
    SelectDriver: id => {
      dispatch(DriverService.FetchDetails(id));
      dispatch(DriverService.FetchListOrders(id));
    },
    AddDriver: driver => {
      dispatch(DriverService.addDriver(driver));
    },
    EditDriver: (id, driver) => {
      dispatch(DriverService.editDriver(id, driver));
    },
    ResetDriver: () => {
      dispatch(DriverService.ResetDriver());
    },
    deleteDriver: driverId => {
      dispatch(DriverService.deleteDriver(driverId));
    },
  };
}

export default connect(StoreToDriversPage, DispatchToDriversPage)(DriverPage);
