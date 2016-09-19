import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Page} from '../components/page';
import {ButtonWithLoading} from '../components/button';
import * as Form from '../components/form';
import * as DriverService from './driverService';
import styles from './styles.css';
import configValues from '../config/configValues.json';
import DateTime from 'react-datetime';
import moment from 'moment';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import {Link} from 'react-router';

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
        return ({isChangePassword: false})
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
    showChangePassword() {
        this.setState({isChangePassword: true});
    },
    submit() {
        let updatedData = lodash.assign({}, this.state);
        delete updatedData.isChangePassword;
        this.props.EditDriver(updatedData);
        console.log(updatedData);
    },
    render() {
        const {isEditing, isFetching} = this.props;
        const Title = this.props.params.id ? "Edit Driver" : "Add Driver";
        const driver = this.props.params.id ? this.props.driver : {};

        const saveBtnProps = {
            textBase: "Save",
            textLoading: "Saving Changes",
            onClick: this.submit,
            styles: {
                base: styles.weightSaveBtn,
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
                        <InputRow label={'Phone Number'} unitLabel={driver.CountryCode} value={driver.PhoneNumber} type={'text'} onChange={this.stateChange('PhoneNumber') } />
                        <InputRow label={'Email'} value={driver.Email} type={'text'} onChange={this.stateChange('Email') } />
                        <InputRow label={'Location'} value={driver.Location} type={'text'} onChange={this.stateChange('Location') } />
                        <InputRow label={'Zip Code'} value={driver.ZipCode} type={'text'} onChange={this.stateChange('ZipCode') } />
                        <InputRow label={'Driving License ID'} value={driver.DrivingLicenseID} type={'text'} onChange={this.stateChange('DrivingLicenseID') } />
                        {
                            !this.state.isChangePassword &&
                            <div className={styles.changePassword} onClick={this.showChangePassword}>
                                Change Password
                            </div>
                        }
                        {
                            this.state.isChangePassword && 
                            <InputRow label={'Password'} type={'password'} onChange={this.stateChange('Password') } />
                        }
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
    return {
        driver,
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
    }
  }
}

export default connect(StoreToDriversPage, mapDispatchToDrivers)(ManagePage);