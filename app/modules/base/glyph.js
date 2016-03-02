import React from 'react';
import styles from './glyph.css';
var classnaming = require('classnames/bind').bind(styles);

const Glyph = ({name}) => {
  let className = classnaming('glyphicon', 'glyphicon-' + name);
  return (<span className={className}></span>);
}

export {Glyph};
