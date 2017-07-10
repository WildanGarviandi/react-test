import React from 'react';
import Dropzone from 'react-dropzone';
import PropTypes from 'prop-types';

import styles from './dragDropImageUploader.scss';
import config from '../config/configValues.json';

export default function DragDropImageUploader({ currentImageUrl, uploadImage }) {
  return (
    <Dropzone
      className={styles.outerDropzone}
      accept={`${config.IMAGE_TYPE.JPEG}, ${config.IMAGE_TYPE.PNG}`}
      onDrop={(acc, reject) => uploadImage(acc, reject)}
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
            <img src={config.IMAGES.DRAG_DROP} />
            Drag your image to this area or tap this button
            below to choose from your folder
            <button>Add Image</button>
          </div>
        );
      }}
    </Dropzone>
  );
}

/* eslint-disable */
DragDropImageUploader.propTypes = {
  currentImageUrl: PropTypes.any,
  uploadImage: PropTypes.func.isRequired,
};
/* eslint-enable */

DragDropImageUploader.defaultProps = {
  currentImageUrl: null,
};
