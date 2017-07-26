import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { ButtonBase, ButtonWithLoading } from '../../views/base';
import { TextareaWithDefault } from '../../components/form';
import styles from './styles.scss';
import * as TripDetails from '../../tripDetails/tripDetailsService';
import getRemarksSetterContainerState from './Selector';

const mapStateToProps = (state) => {
  const stateToProps = getRemarksSetterContainerState(state);
  return stateToProps;
};

const mapDispatchToProps = (dispatch) => {
  const dispatchFunc = {
    saveTripDetails: (tripID, details) => {
      dispatch(TripDetails.EditTrip(tripID, details));
    },
    changeRemarks: () => {
      dispatch(TripDetails.ChangeRemarks());
    },
    cancelChangingRemarks: () => {
      dispatch(TripDetails.CancelChangingRemarks());
    },
  };

  return dispatchFunc;
};

class RemarksSetter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      edit: {
        remarks: '',
      },
    };

    this.saveTripDetails = this.saveTripDetails.bind(this);
    this.changeRemarks = this.changeRemarks.bind(this);
    this.cancelChangingRemarks = this.cancelChangingRemarks.bind(this);
  }
  saveTripDetails() {
    this.props.saveTripDetails(this.props.trip.TripID, { remarks: this.state.edit.remarks });
  }
  changeRemarks() {
    this.props.changeRemarks();
  }
  cancelChangingRemarks() {
    this.props.cancelChangingRemarks();
  }
  changeState(key) {
    return (value) => {
      this.setState({
        edit: {
          [key]: value,
        },
      });
    };
  }
  render() {
    const { isChangingRemarks, trip, isTripEditing } = this.props;
    return (
      <div className={styles.remarksContainer}>
        <span className={styles.remarksTitle}>Remarks / Notes:</span>
        { !isChangingRemarks &&
          <ButtonBase onClick={this.changeRemarks} styles={styles.remarksEdit}>
            Edit
          </ButtonBase>
        }
        <div>
          <TextareaWithDefault
            currentText={trip.Notes}
            onChange={this.changeState('remarks')}
            type={'text'}
            disabled={!isChangingRemarks}
            styles={{ input: styles['remarks-textarea'] }}
          />
          {isChangingRemarks &&
            <div className={styles['float-right']}>
              <ButtonBase onClick={this.cancelChangingRemarks} styles={styles.remarksCancel}>
                Cancel
              </ButtonBase>
              <ButtonWithLoading
                textBase={'Save'}
                textLoading={'Updating'}
                isLoading={isTripEditing}
                onClick={this.saveTripDetails}
                styles={{ base: styles.remarksSave }}
              />
            </div>
          }
        </div>
      </div>
    );
  }
}

/* eslint-disable */
RemarksSetter.propTypes = {
  saveTripDetails: PropTypes.func,
  trip: PropTypes.any,
  changeRemarks: PropTypes.func,
  cancelChangingRemarks: PropTypes.func,
  isChangingRemarks: PropTypes.bool,
  isTripEditing: PropTypes.bool,
};
/* eslint-enable */

RemarksSetter.defaultProps = {
  saveTripDetails: () => {},
  trip: {},
  changeRemarks: () => {},
  cancelChangingRemarks: () => {},
  isChangingRemarks: false,
  isTripEditing: false,
};

export default connect(mapStateToProps, mapDispatchToProps)(RemarksSetter);
