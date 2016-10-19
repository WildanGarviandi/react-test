import config from '../../../config.json';
import React from 'react';
import {connect} from 'react-redux';
import FetchPost from '../../modules/fetch/post';
import styles from './ImageUploader.css';

const ImageUploader = React.createClass({
  getInitialState() {
    return ({
      isUploading: false
    });
  },
  uploadImage(e) {
    if (e.target && e.target.files) {
      var formData = new FormData();
      formData.append('file', e.target.files[0]);
      this.setState({'isUploading': true});
      FetchPost(`/upload/picture`, this.props.token, formData, true).then((res) => {
        if (res.status == 200) {
          return res.json();
        }
      }).then((data) => {
        this.props.updateImageUrl(data.data.Location);
        this.setState({'isUploading': false});
      });
    }
  },
  render() {
    return (
      <div>
        {
          typeof this.props.currentImageUrl === "string" &&
          <img className={styles.thumbnail} src={this.props.currentImageUrl} alt="Receipt" />
        }
        {
          this.state.isUploading ?
          <label className={styles.disabledFileLabel}>
            Uploading..
          </label>
          :
          <label className={styles.fileLabel}>
            Upload New Picture
            <input type="file"
              onChange={(e) => this.uploadImage(e)}
              accept="image/*"
              name="file"
              className={styles.fileInput}
            />
          </label>
        }
      </div>
    );
  }
});

function getToken(state) {
  const {userLogged} = state.app;
  const {token} = userLogged;

  return {
    token
  };
}

export default connect(getToken)(ImageUploader);