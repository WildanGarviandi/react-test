import React, { PureComponent } from 'react';

import classNames from 'classnames';
import PropTypes from 'prop-types';

import ButtonBase from './ButtonBase';
import baseStyle from './styles.scss';

export default class ButtonStandard extends PureComponent {
  render() {
    const { textBase, isLoading, onClick, styles = {}, base, urlImage } = this.props;
    const btnClass = classNames(baseStyle.btnStandard,
      { [baseStyle.loading]: isLoading }, styles.base);
    const elem = (
      <span>
        {
          urlImage &&
          <img
            alt="button img"
            src={urlImage}
            className={baseStyle.buttonImage}
          />
        }
        <span className={baseStyle.buttonTitle}>
          {textBase}
        </span>
      </span>
    );

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
ButtonStandard.propTypes = {
  textBase: PropTypes.any,
  textLoading: PropTypes.any,
  isLoading: PropTypes.bool,
  onClick: PropTypes.func,
  styles: PropTypes.object,
  base: PropTypes.any,
  urlImage: PropTypes.any,
};
/* eslint-enable */

ButtonStandard.defaultProps = {
  textBase: '',
  textLoading: '',
  isLoading: false,
  onClick: () => { },
  styles: {},
  base: {},
  urlImage: '',
};
