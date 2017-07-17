import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { ButtonBase, ButtonWithLoading } from '../../views/base';
import { TextareaWithDefault } from '../form';
import styles from './styles.scss';
import * as TripDetails from '../../tripDetails/tripDetailsService';

class RemarksSetter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showEdit: true,
      edit: {
        remarks: '',
      },
    };

    this.setRemarksText = this.setRemarksText.bind(this);
    this.editRemarks = this.editRemarks.bind(this);
    this.cancelChangingRemarks = this.cancelChangingRemarks.bind(this);
  }
  setRemarksText() {
    this.props.saveTripDetails(this.props.trip.TripID, { remarks: this.state.edit.remarks });
  }
  editRemarks() {
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
        {
          !isChangingRemarks &&
          <span>
            <span className={styles.remarksContent} >
              <span className={styles.remarksText}>{trip.Notes}</span>
              {
                this.state.showEdit &&
                <ButtonBase onClick={this.editRemarks} styles={styles.remarksEdit}>
                  Edit
                </ButtonBase>
              }
            </span>
          </span>
        }
        {
          isChangingRemarks &&
          <div>
            <div className={styles.remarksContent}>
              <TextareaWithDefault currentText={trip.Notes} onChange={this.changeState('remarks')} type={'text'} />
            </div>
            <ButtonBase onClick={this.cancelChangingRemarks} styles={styles.remarksCancel}>
              Cancel
            </ButtonBase>
            <ButtonWithLoading
              textBase={'Save'}
              textLoading={'Updating'}
              isLoading={isTripEditing}
              onClick={this.setRemarksText}
              styles={{ base: styles.remarksSave }}
            />
          </div>
        }
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

const mapStateToProps = (state) => {
  const { tripDetails } = state.app;
  const { isChangingRemarks, isTripEditing } = tripDetails;

  return {
    isChangingRemarks,
    isTripEditing,
  };
};

const mapDispatchToProps = (dispatch) => {
  const DispatchFunc = {
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

  return DispatchFunc;
};

export default connect(mapStateToProps, mapDispatchToProps)(RemarksSetter);
