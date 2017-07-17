import React, { PureComponent } from 'react';

import classNames from 'classnames';
import PropTypes from 'prop-types';

import ButtonBase from './ButtonBase';
import baseStyle from './styles.scss';

export default class ButtonWithLoading extends PureComponent {
  render() {
    const { textBase, textLoading, isLoading, onClick, styles = {}, base } = this.props;
    const btnClass = classNames(baseStyle.btnBase, { [baseStyle.loading]: isLoading }, styles.base);
    const spinnerClass = classNames(baseStyle.spinner, styles.spinner);
    let elem = textBase;

    if (isLoading) {
      elem = (<span className={spinnerClass}>{textLoading}</span>);
    }

    return (
      <ButtonBase
        styles={btnClass}
        onClick={onClick}
        disabled={isLoading}
        {...base}
      >
        {elem}
      </ButtonBase>
    );
  }
}

/* eslint-disable */
ButtonWithLoading.propTypes = {
  textBase: PropTypes.any,
  textLoading: PropTypes.any,
  isLoading: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
  styles: PropTypes.object,
  base: PropTypes.any,
};
/* eslint-enable */

ButtonWithLoading.defaultProps = {
  textBase: '',
  textLoading: '',
  isLoading: false,
  onClick: () => { },
  styles: {},
  base: {},
};
