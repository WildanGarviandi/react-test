import React from 'react';
import {ButtonBase} from './';
import styles from './page.css';

const PageTitle = ({title}) => {
  return (<h2 className={styles.contentTitle}>{title}</h2>);
}

const ButtonAtRightTop = ({onClick, val}) => {
  return (<ButtonBase styles={styles.mainBtn} onClick={onClick}>{val}</ButtonBase>);
}

export {ButtonAtRightTop, PageTitle};
