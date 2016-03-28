import React from 'react';
import styles from './glyph.css';
var classnaming = require('classnames/bind').bind(styles);

const Glyph = ({className, name}) => {
  let stylename = classnaming(className, 'glyphicon', 'glyphicon-' + name);
  return (<span className={stylename}></span>);
}

export {Glyph};
