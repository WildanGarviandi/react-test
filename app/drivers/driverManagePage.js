import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Page} from '../components/page';
import {ButtonWithLoading} from '../components/button';
import * as Form from '../components/form';
import * as DriverService from './driverService';
import styles from './styles.css';
import configValues from '../config/configValues.json';
import configEnv from '../../config.json';
import DateTime from 'react-datetime';
import moment from 'moment';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import {Link} from 'react-router';
import stylesButton from '../components/button.css';

const InputRow = React.createClass({
  render() {
    const {isEditing, label, value, onChange, type} = this.props;

    return (
      <div style={{clear: 'both'}}>
        <span className={styles.itemLabel}>{label}</span>
          <span className={styles.itemValue}>
            {this.props.unitLabel}
            <Form.InputWithDefault currentText={value} onChange={this.props.onChange} type={type} />
          </span>
      </div>
    );
  }
});

const DropdownRow = React.createClass({
  render() {
    const {isEditing, label, value, onChange, type, options, handleSelect} = this.props;

    return (
      <div style={{clear: 'both'}}>
        <span className={styles.itemLabel}>{label}</span>
          <span className={styles.itemValue}>
            <Form.DropdownWithState initialValue={value} options={options} handleSelect={handleSelect} />
          </span>
      </div>
    );
  }
});

const DatetimeRow = React.createClass({
    render() {
        const {isEditing, label, value, onChange, type, options, handleSelect} = this.props;

        return (
          <div style={{clear: 'both'}}>
            <span className={styles.itemLabel}>{label}</span>
              <span className={styles.itemValue}>
                <DateTime onChange={this.props.onChange} defaultValue={value} />
              </span>
          </div>
        );
    }
});

const ManagePage = React.createClass({
    getInitialState() {
        return ({});
    },
    componentWillMount() {
        if (this.props.params.id) {
            this.props.GetDetails();
        } else {
            this.props.ResetManageDriver();
        }
    },
    stateChange(key) {
        return (value) => {
            this.setState({[key]: value});
            if (typeof value === 'object') {
                this.setState({[key]: value.key});
            }
        };
    },
    submit() {
        const mandatoryFields = ['FirstName', 'LastName', 'PhoneNumber', 'Email', 'Location', 'StateID', 'ZipCode', 'PackageSizeID'];
        const filledFields = Object.keys(this.state);
        const unfilledFields = lodash.difference(mandatoryFields, filledFields);
        if (unfilledFields.length > 0 && !this.props.params.id) {
            alert('Missing ' + unfilledFields.join())
            return;
        }
        let updatedData = lodash.assign({}, this.state);
        this.props.params.id ? this.props.EditDriver(updatedData) : this.props.AddDriver(updatedData);
        console.log(updatedData);
    },
    render() {
        const {isEditing, isFetching, stateList, cityList} = this.props;
        const Title = this.props.params.id ? "Edit Driver" : "Add Driver";
        const driver = this.props.params.id ? this.props.driver : {};
        const vehicleOptions = configValues.vehicle;
        const vehicleValue = this.props.params.id ? 
            lodash.find(vehicleOptions, { 'key': driver.PackageSizeMaster && driver.PackageSizeMaster.PackageSizeID }) : '';

        const cityOptions = lodash.chain(cityList)
             .map((key, val) => ({key:key, value: val.toUpperCase()}))
             .sortBy((arr) => (arr.key))
             .value();

        const stateOptions = lodash.chain(stateList)
             .map((key, val) => ({key:key, value: val.toUpperCase()}))
             .sortBy((arr) => (arr.key))
             .value();

        const saveBtnProps = {
            textBase: "Save",
            textLoading: "Saving Changes",
            onClick: this.submit,
            styles: {
                base: stylesButton.greenButton,
            },
        };

        if (isFetching) {
            return (
                <Page title={Title}>
                    <div>
                        Loading
                    </div>
                </Page>
            );
        } else {
            return (
                <Page title={Title}>
                    <div className={styles.driverDetailsHeader}>
                        Driver Information
                    </div>
                    <div className={styles.driverDetailsInformation}>
                        <InputRow label={'First Name'} value={driver.FirstName} type={'text'} onChange={this.stateChange('FirstName') } />
                        <InputRow label={'Last Name'} value={driver.LastName} type={'text'} onChange={this.stateChange('LastName') } />
                        <InputRow label={'Phone Number'} unitLabel={configEnv.defaultCountryCode} value={driver.PhoneNumber} type={'text'} onChange={this.stateChange('PhoneNumber') } />
                        <InputRow label={'Email'} value={driver.Email} type={'text'} onChange={this.stateChange('Email') } />
                        <InputRow label={'Location'} value={driver.Location} type={'text'} onChange={this.stateChange('Location') } />
                        <DropdownRow label={'State'} value={driver.State && driver.State.Name} options={stateOptions} handleSelect={this.stateChange('StateID')} />
                        <InputRow label={'Zip Code'} value={driver.ZipCode} type={'text'} onChange={this.stateChange('ZipCode') } />
                        <DropdownRow label={'Vehicle'} value={vehicleValue && vehicleValue.value} options={vehicleOptions} handleSelect={this.stateChange('PackageSizeID')} />
                        <InputRow label={'Driving License ID'} value={driver.DrivingLicenseID} type={'text'} onChange={this.stateChange('DrivingLicenseID') } />
                        <InputRow label={'Password'} type={'password'} onChange={this.stateChange('Password') } />
                    </div>
                    <div style={{clear: 'both'}}>
                        { <ButtonWithLoading {...saveBtnProps} /> }
                    </div>
                </Page>
            );
        }
    }
});

function StoreToDriversPage(store) {
    const {isEditing, driver, isFetching} = store.app.myDrivers;
    const {cities} = store.app.cityList;
    const {states} = store.app.stateList;
    let cityList = {}; 
    cities.forEach(function(city) {
        cityList[city.Name] = city.CityID;
    });
    let stateList = {}; 
    states.forEach(function(state) {
        stateList[state.Name] = state.StateID;
    });
    return {
        driver,
        cityList,
        stateList,
        isEditing,
        isFetching
    }
}

function mapDispatchToDrivers(dispatch, ownProps) {
  return {
    ResetManageDriver: () => {
      dispatch(DriverService.resetManageDriver());
    },
    GetDetails: () => {
      dispatch(DriverService.fetchDetails(ownProps.params.id));
    },
    EditDriver: (order) => {
      dispatch(DriverService.editDriver(ownProps.params.id, order));
    },
    AddDriver: (order) => {
      dispatch(DriverService.addDriver(order));
    }
  }
}

export default connect(StoreToDriversPage, mapDispatchToDrivers)(ManagePage);