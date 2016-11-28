import React from 'react';
import {connect} from 'react-redux';
import classNaming from 'classnames';
import lodash from 'lodash';

import {ButtonWithLoading, CheckBox, Input} from '../base';
import {DropdownWithState} from '../base/dropdown'
import styles from './styles.css';
import configValues from '../../config/configValues.json';
import * as CountryService from '../../location/countryService';
import * as StateService from '../../location/stateService';
import * as CityService from '../../location/cityService';
import * as RegisterAction from '../../modules/auth/actions/register';
import Recaptcha from 'react-recaptcha';
import config from '../../../config.json';

const BasicInput = (props) => {
  var inputStyles = {
    container: styles.inputWrapper,
    input: classNaming(styles.inputText, {[styles.inputError]: props.isError}, {[styles.inputTextWithPrefix]: props.prefix}),
    notes: styles.inputNotes
  }

  return (
    <div style={{clear: 'both'}}>
      <span className={styles.itemValue}>
        {props.prefix}
        <Input {...props} styles={inputStyles} className={inputStyles.input} />
      </span>
    </div>
  );
}

const DropdownInput = React.createClass({
  render() {
    const {value, options, handleSelect} = this.props;

    return (
      <div className={styles.inputDropdown} >
        <DropdownWithState initialValue={value} options={options} handleSelect={handleSelect} />
      </div>
    );
  }
});


const Register = ({input, handleInputChange, handleSubmit, registerState, countryList, stateList, cityList, verifyCallback}) => {
  const companyNameInputProps = {
    base: {
      value: input.companyName,
      placeholder:"Company Name",
      required: true,
      type: "text"
    },
    onChange: handleInputChange('companyName'),
    isError: registerState.isError
  }

  const fleetManagerInputProps = {
    base: {
      value: input.fleetManager,
      placeholder:"Fleet Manager",
      required: true,
      type: "text"
    },
    onChange: handleInputChange('fleetManager'),
    isError: registerState.isError
  }

  const phoneNumberInputProps = {
    base: {
      value: input.phoneNumber,
      placeholder:"Phone Number",
      required: true,
      type: "text"
    },
    onChange: handleInputChange('phoneNumber'),
    isError: !registerState.validPhoneNumber,
    notes: !registerState.validPhoneNumber ? 'Phone number is already exist' : '',
    prefix: config.defaultCountryCode
  }

  const zipCodeInputProps = {
    base: {
      value: input.zipCode,
      placeholder:"Zip Code",
      required: true,
      type: "text"
    },
    onChange: handleInputChange('zipCode'),
    isError: registerState.isError
  }

  const emailInputProps = {
    base: {
      value: input.email,
      placeholder:"Email",
      required: true,
      type: "text"
    },
    onChange: handleInputChange('email'),
    isError: !registerState.validEmail,
    notes: !registerState.validEmail ? 'Email is already exist' : ''
  }

  const passwordInputProps = {
    base: {
      value: input.password,
      placeholder:"Password",
      required: true,
      type: "password"
    },
    onChange: handleInputChange('password'),
    isError: registerState.isError
  }

  const confirmPasswordInputProps = {
    base: {
      value: input.confirmPassword,
      placeholder:"Confirm Password",
      required: true,
      type: "password"
    },
    onChange: handleInputChange('confirmPassword'),
    isError: !registerState.validConfirmPassword,
    notes: !registerState.validConfirmPassword ? 'Password is not match' : ''
  }

  const submitBtnProps = {
    base: {type: 'submit'},
    isLoading: registerState.isFetching,
    styles: {base: styles.submitBtn, spinner: styles.submitBtnSpinner},
    textBase: 'REGISTER',
    textLoading: 'REGISTERING'
  }

  const vehicleOptions = configValues.vehicle;
  const countryOptions = lodash.chain(countryList)
   .map((key, val) => ({key:key, value: val.toUpperCase()}))
   .sortBy((arr) => (arr.key))
   .value();

  const stateOptions = lodash.chain(stateList)
   .map((key, val) => ({key:key, value: val.toUpperCase()}))
   .sortBy((arr) => (arr.key))
   .value();

  const cityOptions = lodash.chain(cityList)
   .map((key, val) => ({key:key, value: val.toUpperCase()}))
   .sortBy((arr) => (arr.key))
   .value();

  var callback = function () {
  };

  return (
    <div className={styles.page}>
      <div className={styles.logo}></div>
      <div className={styles.panel}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h4 className={styles.header}>Sign Up</h4>
          <BasicInput {...companyNameInputProps} />
          <BasicInput {...fleetManagerInputProps} />
          <BasicInput {...phoneNumberInputProps} />
          <DropdownInput value={'Select Country'} options={countryOptions} handleSelect={handleInputChange('countryID')} />
          { registerState.showState &&
            <DropdownInput value={'Select State'} options={stateOptions} handleSelect={handleInputChange('stateID')} />
          }
          { registerState.showCity &&  
            <DropdownInput value={'Select City'} options={cityOptions} handleSelect={handleInputChange('cityID')} />
          }
          <BasicInput {...zipCodeInputProps} />
          <BasicInput {...emailInputProps} />
          <BasicInput {...passwordInputProps} />
          <BasicInput {...confirmPasswordInputProps} />
          <div style={{marginTop: 15}}>
            <Recaptcha
              sitekey={config.googleSiteKey}
              render="explicit"
              onloadCallback={callback}
              verifyCallback={verifyCallback} />
          </div>
          { !registerState.validRegistration && <span className={styles.errorMsg}>{registerState.invalidMessage}</span> }
          <ButtonWithLoading {...submitBtnProps} />
        </form>
      </div>
    </div>
  );
}

const RegisterPage = React.createClass({
  getInitialState() {
    return { 
      companyName: '', 
      fleetManager: '', 
      phoneNumber: '', 
      countryID: '', 
      stateID: '', 
      cityID: '', 
      zipCode: '', 
      email: '', 
      password: '', 
      confirmPassword: '',
      showState: false,
      showCity: false,
      validConfirmPassword: true,
      validPhoneNumber: this.props.isPhoneValid,
      validEmail: this.props.isEmailValid,
      validRegistration: this.props.isSuccess,
      invalidMessage: '',
      'g-recaptcha-response': '' 
    };
  },
  componentWillMount() {
    this.props.fetchCountries();
  },
  componentWillReceiveProps(nextProps) {
    this.setState({
      validPhoneNumber: nextProps['isPhoneValid']
    });
    this.setState({
      validEmail: nextProps['isEmailValid']
    });
    this.setState({
      validRegistration: nextProps['isSuccess']
    });
    this.setState({
      invalidMessage: nextProps['messageFailed']
    });
  },
  handleInputChange(key) {
    return (val) => {
      this.setState({[key]: val});
      if (key === 'countryID') {
        this.props.fetchStates(val.key);
        this.setState({[key]: val.key});
        this.setState({['showState']: true});
      }
      if (key === 'stateID') {
        this.props.fetchCities(val.key);
        this.setState({[key]: val.key});
        this.setState({['showCity']: true});
      }
      if (key === 'cityID') {
        this.setState({[key]: val.key});
      }
      if (key === 'phoneNumber') {
        this.props.checkPhone(val);
      }
      if (key === 'email') {
        this.props.checkEmail(val);
      }
      if (key === 'confirmPassword') { 
        if (val === this.state.password) {
          this.setState({['validConfirmPassword']: true});
        } else {
          this.setState({['validConfirmPassword']: false});
        }
      }
      if (key === 'password') { 
        if (val === this.state.confirmPassword) {
          this.setState({['validConfirmPassword']: true});
        } else {
          this.setState({['validConfirmPassword']: false});
        }
      }
    };
  },
  handleSubmit(event) {
    event.preventDefault();
    if (!this.state.validConfirmPassword || !this.state.validPhoneNumber || !this.state.validEmail) {
      alert ('Please fill all fields with valid value');
      return;
    } else {
      this.props.register(this.state);
    }
  },
  verifyCaptcha(response) {
    this.setState({['g-recaptcha-response']: response});
  },
  render() {
    const {countryList, stateList, cityList} = this.props;

    return (
      <Register 
        input={this.state} 
        handleInputChange={this.handleInputChange} 
        handleSubmit={this.handleSubmit} 
        registerState={this.state} 
        countryList={countryList} 
        stateList={stateList}
        cityList={cityList}
        verifyCallback={this.verifyCaptcha} />
    );
  }
});

const mapStateToProps = (state) => {
  const {isFetching, isValid, message} = state.app.userLogged;
  const {countries} = state.app.publicCountryList;
  const {states} = state.app.publicStateList;
  const {cities} = state.app.publicCityList;
  const {isEmailValid, isPhoneValid, isSuccess, messageFailed} = state.app.registerData;
  let countryList = {}; 
  countries.forEach(function(country) {
      countryList[country.Name] = country.CountryID;
  });

  let stateList = {}; 
  states.forEach(function(state) {
      stateList[state.Name] = state.StateID;
  });

  let cityList = {}; 
  cities.forEach(function(city) {
      cityList[city.Name] = city.CityID;
  });

  return {
    countryList,
    stateList,
    cityList,
    isEmailValid,
    isPhoneValid,
    isSuccess,
    messageFailed
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchCountries() {
      dispatch(CountryService.FetchList());
    },
    fetchStates(countryID) {
      dispatch(StateService.FetchList(countryID));
    },
    fetchCities(stateID) {
      dispatch(CityService.FetchList(stateID));
    },
    register(registerData) {
      dispatch(RegisterAction.Register(registerData));
    },
    checkEmail(email) {
      dispatch(RegisterAction.CheckEmailExists(email));
    },
    checkPhone(phone) {
      dispatch(RegisterAction.CheckPhoneExists(phone));
    }
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(RegisterPage);
