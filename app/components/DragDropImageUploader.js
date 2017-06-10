import React, { Component } from 'react'; //eslint-disable-line
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import PropTypes from 'prop-types';

import FetchPost from '../modules/fetch/post';
import styles from './dragDropImageUploader.scss';
import config from '../config/configValues.json';
import ModalActions from '../modules/modals/actions';
import { modalAction } from '../modules/modals/constants';

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

class DragDropImageUploader extends Component {

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
    const { currentImageUrl } = this.props;

    return (
      <Dropzone
        className={styles.outerDropzone}
        accept="image/jpeg, image/png"
        onDrop={(acc, reject) => this.uploadImage(acc, reject)}
      >
        {({ isDragReject }) => {
          if (isDragReject) {
            return 'Some files will be rejected';
          }
          if (currentImageUrl) {
            return (
              <div className={styles.dragDropFiller}>
                <img className={styles.imgPreview} src={currentImageUrl} />
                <button>Edit Image</button>
              </div>
            );
          }
          return (
            <div className={styles.dragDropFiller}>
              <img src="/img/icon-add-image-drag-drop.png" />
              Drag your image to this area or tap this button
              below to choose from your folder
              <button>Add Image</button>
            </div>
          );
        }}
      </Dropzone>
    );
  }
}

/* eslint-disable */
DragDropImageUploader.propTypes = {
  token: PropTypes.any,
  updateImageUrl: PropTypes.func.isRequired,
  currentImageUrl: PropTypes.any,
  showBackdrop: PropTypes.func.isRequired,
  hideBackdrop: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
};
/* eslint-enable */

DragDropImageUploader.defaultProps = {
  token: null,
  currentImageUrl: null,
};

export default connect(mapStateToProps, mapDispatchToProps)(DragDropImageUploader);
