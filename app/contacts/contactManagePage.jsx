import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Page} from '../components/page';
import {ButtonWithLoading} from '../components/button';
import * as Form from '../components/form';
import * as ContactService from './contactService';
import styles from './styles.scss';
import configValues from '../config/configValues.json';
import configEnv from '../../config.json';
import DateTime from 'react-datetime';
import moment from 'moment';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import {Link} from 'react-router';
import stylesButton from '../components/button.scss';

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

const TextareaRow = React.createClass({
  render() {
    const {isEditing, label, value, onChange, type} = this.props;

    return (
      <div style={{clear: 'both'}}>
        <span className={styles.itemLabel}>{label}</span>
          <span className={styles.itemValue}>
            {this.props.unitLabel}
            <Form.TextareaWithDefault currentText={value} onChange={this.props.onChange} type={type} />
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
            this.props.ResetManageContact();
        }
    },
    componentWillReceiveProps() {
        if (Object.keys(this.props.contact).length !== 0) {
            this.setState({
                FirstName: this.props.contact.FirstName,
                LastName: this.props.contact.LastName,
                Phone: this.props.contact.Phone,
                Email: this.props.contact.Email,
                Street: this.props.contact.Street,
                StateID: (this.props.contact.State) ? this.props.contact.State.StateID : '',
                City: this.props.contact.City,
                ZipCode: this.props.contact.ZipCode,
            });
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
        const mandatoryFields = ['FirstName', 'LastName', 'Phone', 'Email', 'Street'];
        const filledFields = Object.keys(this.state);
        const unfilledFields = lodash.difference(mandatoryFields, filledFields);
        if (unfilledFields.length > 0 && !this.props.params.id) {
            alert('Missing ' + unfilledFields.join())
            return;
        }
        let updatedData = lodash.assign({}, this.state);
        this.props.params.id ? this.props.EditContact(updatedData) : this.props.AddContact(updatedData);
        console.log(updatedData);
    },
    render() {
        const {isEditing, isFetching, stateList} = this.props;
        const Title = this.props.params.id ? "Edit Contact" : "Add Contact";
        const contact = this.props.params.id ? this.props.contact : {};

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
                    <div className={styles.contactDetailsHeader}>
                        Contact Information
                    </div>
                    <div className={styles.contactDetailsInformation}>
                        <InputRow label={'First Name'} value={this.state.FirstName} type={'text'} onChange={this.stateChange('FirstName') } />
                        <InputRow label={'Last Name'} value={this.state.LastName} type={'text'} onChange={this.stateChange('LastName') } />
                        <InputRow label={'Phone Number'} value={this.state.Phone} type={'text'} onChange={this.stateChange('Phone') } />
                        <InputRow label={'Email'} value={this.state.Email} type={'text'} onChange={this.stateChange('Email') } />
                        <TextareaRow label={'Address'} value={this.state.Street} type={'text'} onChange={this.stateChange('Street') } />
                        <DropdownRow label={'State'} value={contact.State && contact.State.Name} options={stateOptions} handleSelect={this.stateChange('StateID')} />
                        <InputRow label={'City'} value={this.state.City} type={'text'} onChange={this.stateChange('City') } />
                        <InputRow label={'Zip Code'} value={this.state.ZipCode} type={'text'} onChange={this.stateChange('ZipCode') } />
                    </div>
                    <div style={{clear: 'both'}}>
                        { <ButtonWithLoading {...saveBtnProps} /> }
                    </div>
                </Page>
            );
        }
    }
});

function StoreToContactsPage(store) {
    const {isEditing, contact, isFetching} = store.app.myContacts;
    const {states} = store.app.stateList;
    let stateList = {}; 
    states.forEach(function(state) {
        stateList[state.Name] = state.StateID;
    });
    return {
        contact,
        stateList,
        isEditing,
        isFetching
    }
}

function mapDispatchToContacts(dispatch, ownProps) {
  return {
    ResetManageContact: () => {
      dispatch(ContactService.resetManageContact());
    },
    GetDetails: () => {
      dispatch(ContactService.fetchDetails(ownProps.params.id));
    },
    EditContact: (order) => {
      dispatch(ContactService.editContact(ownProps.params.id, order));
    },
    AddContact: (order) => {
      dispatch(ContactService.addContact(order));
    }
  }
}

export default connect(StoreToContactsPage, mapDispatchToContacts)(ManagePage);