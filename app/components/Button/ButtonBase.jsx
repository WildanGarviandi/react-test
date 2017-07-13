import React, { PureComponent } from 'react';

import classNames from 'classnames';
import PropTypes from 'prop-types';

import baseStyle from './styles.scss';

export default class ButtonBase extends PureComponent {
  render() {
    const { children, onClick, styles, type, width, disabled, base } = this.props;
    const btnClass = classNames(baseStyle.btnBase, styles);

    return (
      <button
        className={btnClass}
        onClick={onClick}
        type={type}
        style={{ width }}
        disabled={disabled}
        {...base}
      >
        {children}
      </button>
    );
  }
}

/* eslint-disable */
ButtonBase.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.any,
  styles: PropTypes.any,
  type: PropTypes.any,
  width: PropTypes.any,
  disabled: PropTypes.bool,
  base: PropTypes.any,
};
/* eslint-enable */

ButtonBase.defaultProps = {
  onClick: () => { },
  children: null,
  styles: {},
  type: '',
  width: {},
  disabled: false,
  base: {},
};
