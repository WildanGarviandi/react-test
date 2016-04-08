import React from 'react';
import styles from './glyph.css';
import classNaming from 'classnames';
var classnaming = require('classnames/bind').bind(styles);

const Glyph = ({className, name}) => {
  let stylename = classNaming(className, styles.glyphicon, styles['glyphicon-' + name]);
  return (<span className={stylename}></span>);
}

export {Glyph};
