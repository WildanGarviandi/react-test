import React from 'react';
import Modal from 'react-modal';
import {Glyph} from '../base';
import styles from './imageUploader.css';

const customStyles = {
  overlay : {
    zIndex : 1000
  },
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    maxHeight             : '400px'
  }
};

const ImagePreview = React.createClass({
  getInitialState() {
    return({
      openModal: false
    })
  },
  openModal(e) {
    e.preventDefault();
    this.setState({openModal: true});
  },
  closeModal() {
    this.setState({openModal: false});
  },
  render() {
    return (
      <span>
      {
        this.props.imageUrl &&
        <span>
          <a href={this.props.imageUrl} onClick={(e) => {this.openModal(e)}} className={styles.modalTrigger}>
            <img src={this.props.imageUrl} className={styles.imgPreview} />
          </a>
          <Modal
            isOpen={this.state.openModal}
            onRequestClose={this.closeModal}
            style={customStyles}
            contentLabel="Example Modal"
          >
            <img className={styles.thumbnail} src={this.props.imageUrl} alt="Receipt" />
            <button className={styles.modalClose} onClick={this.closeModal}><Glyph className={styles.glyphRemove} name={'remove'}/></button>
          </Modal>
        </span>
      }
      </span>
    );
  }
});

export default ImagePreview;