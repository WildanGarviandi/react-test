import React from 'react';
import styles from './glyph.scss';
import classNaming from 'classnames';

const Glyph = ({className, name}) => {
  let stylename = classNaming(className, styles.glyphicon, styles['glyphicon-' + name]);
  return (<span className={stylename}></span>);
}

export {Glyph};
