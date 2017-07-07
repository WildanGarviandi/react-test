import React from 'react';

import PropTypes from 'prop-types';
import classNaming from 'classnames';

import styles from './glyph.scss';

function Glyph({ className, name }) {
  console.log('components/glyph');
  const stylename = classNaming(className, styles.glyphicon, styles[`glyphicon-${name}`]);
  return <span className={stylename} />;
}

/* eslint-disable */
Glyph.propTypes = {
  className: PropTypes.any,
  name: PropTypes.any,
}
/* eslint-disable */

Glyph.defaultProps = {
  className: '',
  name: '',
}

export default Glyph;
