import React from 'react';
import styles from './modal.css';

var classnaming = require('classnames/bind').bind(styles);

function Modal(props) {
  let wrapperClass = classnaming('wrapper', {show: props.show});

  var modalStyle = {
    width: (props.width ? props.width : "500px")
  }

  return (
    <div className={wrapperClass}>
      <div className={styles.backdrop}></div>
      <div style={{position: 'absolute', width: '100%'}}>
        <div className={styles.modal} style={modalStyle}>
          {props.children}
          <div style={{clear: 'both'}} />
        </div>
      </div>
    </div>
  );
}

export default Modal;
