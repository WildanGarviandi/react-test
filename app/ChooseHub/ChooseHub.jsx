import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import PropTypes from 'prop-types';

import configValues from '../config/configValues.json';
import styles from './styles.scss';
import DropdownList from '../components/DropdownMenu';
import getCurrentState from './Selector';
import { ChooseHubAction } from '../modules/';

const mapStateToProps = state => {
  const stateToProps = getCurrentState(state);
  return stateToProps;
};

const mapDispatchToProps = dispatch => {
  const dispatchData = bindActionCreators(
    {
      chooseHub: ChooseHubAction.chooseHub
    },
    dispatch
  );

  return dispatchData;
};

class ChooseHub extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.hubs.map(hub => {
        const prefix =
          hub.Hub.Type === configValues.HUB_TYPE.GENERAL ? 'Local ' : '';
        const data = {
          id: hub.Hub.HubID,
          name: `${prefix}${hub.Hub.Name}`,
          iconStyles: styles['etobee-logo']
        };
        return data;
      })
    };
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect(selectedData) {
    this.props.chooseHub(selectedData.id);
  }

  render() {
    return (
      <div className={styles.page}>
        <div className={styles.choose}>
          <div className={styles.choose__header}>
            <div className={styles['header-top']}>
              <div className={styles['header-top__img']}>
                <img src={configValues.IMAGES.LOGO} alt="etobee logo" />
              </div>
              <div className={styles['header-top__title']}>
                <span>etobee</span>
              </div>
            </div>
            <div className={styles['choose__header-hub']}>
              <span>Choose a hub</span>
            </div>
          </div>
          <DropdownList
            data={this.state.data}
            handleSelect={this.handleSelect}
            dropdownStyles={styles['dropdown-list']}
            dropdownItemStyles={styles['dropdown-hub']}
            contentStyles={styles['dropdown-content']}
          />
        </div>
      </div>
    );
  }
}

/* eslint-disable */
ChooseHub.propTypes = {
  hubs: PropTypes.array.isRequired,
  chooseHub: PropTypes.func.isRequired
};
/* eslint-enable */

export default connect(mapStateToProps, mapDispatchToProps)(ChooseHub);
