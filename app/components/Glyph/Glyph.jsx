// Glyph.react.js
import React, { PureComponent } from 'react';

import PropTypes from 'prop-types';
import classNaming from 'classnames';

import styles from './glyph.scss';

class Glyph extends PureComponent {
  render() {
    const { className, name } = this.props;
    const stylename = classNaming(className, styles.glyphicon, styles[`glyphicon-${name}`]);
    return <span className={stylename} />;
  }
}

/* eslint-disable */
Glyph.propTypes = {
  className: PropTypes.any,
  name: PropTypes.any,
};
/* eslint-enable */

Glyph.defaultProps = {
  className: '',
  name: '',
};

export default Glyph;
