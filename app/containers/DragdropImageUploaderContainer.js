import React, { Component } from 'react'; // eslint-disable-line
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import FetchPost from '../modules/fetch/post';
import config from '../config/configValues.json';
import ModalActions from '../modules/modals/actions';
import { modalAction } from '../modules/modals/constants';
import DragdropImageUploader from '../components/DragDropImageUploader';

const mapStateToProps = (store) => {
  const { userLogged } = store.app;
  const { token } = userLogged;

  return {
    token,
  };
};

const mapDispatchToProps = (dispatch) => {
  const dispatchData = {
    showBackdrop: () => {
      dispatch({ type: modalAction.BACKDROP_SHOW });
    },
    hideBackdrop: () => {
      dispatch({ type: modalAction.BACKDROP_HIDE });
    },
    showModal: (text) => {
      dispatch(ModalActions(text));
    },
  };

  return dispatchData;
};

class DragDropImageUploaderContainer extends Component {
  uploadImage(acc) {
    if (acc) {
      const formData = new FormData();
      formData.append('file', acc[0]);
      this.props.showBackdrop();
      FetchPost('/upload/picture', this.props.token, formData, false, true)
        .then(res => res.status === config.HTTP_STATUS.OK && res.json())
        .then((data) => {
          this.props.updateImageUrl(data.data.Location);
          this.props.hideBackdrop();
        })
        .catch((e) => {
          const message = (e && e.message) || 'Failed to upload image';
          this.props.showModal(message);
          this.props.hideBackdrop();
        });
    }
  }

  render() {
    return (
      <DragdropImageUploader
        currentImageUrl={this.props.currentImageUrl}
        uploadImage={(acc, reject) => this.uploadImage(acc, reject)}
      />
    );
  }
}

/* eslint-disable */
DragDropImageUploaderContainer.propTypes = {
  token: PropTypes.any,
  updateImageUrl: PropTypes.func.isRequired,
  currentImageUrl: PropTypes.any,
  showBackdrop: PropTypes.func.isRequired,
  hideBackdrop: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
};
/* eslint-enable */

DragDropImageUploaderContainer.defaultProps = {
  token: null,
  currentImageUrl: null,
};

export default connect(mapStateToProps, mapDispatchToProps)(DragDropImageUploaderContainer);
