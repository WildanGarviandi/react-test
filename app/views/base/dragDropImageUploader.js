import React, { Component } from 'react';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import FetchPost from '../../modules/fetch/post';
import styles from './dragDropImageUploader.css';

class DragoDropImageUploader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUploading: false
    };
  }

  uploadImage(acc, reject) {
    console.log(acc, 'acc');
    console.log(reject, 'reject');
    if (acc && acc.file) {
      var formData = new FormData();
      formData.append('file', acc.file[0]);
      this.setState({'isUploading': true});
      FetchPost(`/upload/picture`, this.props.token, formData, false, true).then((res) => {
        if (res.status == 200) {
          return res.json();
        }
      }).then((data) => {
        this.props.updateImageUrl(data.data.Location);
        this.setState({'isUploading': false});
      });
    }
  }

  render() {
    return(
      <Dropzone
        className={styles.outerDropzone}
        accept="image/jpeg, image/png"
        onDrop={(acc, reject) => this.uploadImage(acc, reject)}
      >
        {({ isDragActive, isDragReject }) => {
          if (isDragReject) {
            return "Some files will be rejected";
          }
          return (
            <div className={styles.dragDropFiller}>
              <img src="/img/icon-add-image-drag-drop.png" />
              Drag your image to this area or tap this button
              below to choose from your folder
              <button>Add Image</button>
            </div>
          )
        }}
      </Dropzone>
    )
  }
}

function getToken(store) {
  const {userLogged} = store.app;
  const {token} = userLogged;

  return {
    token
  };
}

export default connect(getToken)(DragoDropImageUploader);
