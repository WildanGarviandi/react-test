import React from 'react';
import classNaming from 'classnames';
import PropTypes from 'prop-types';

import styles from '../styles.scss';
import { Input } from '../../views/base';

export default class LoginInput extends React.Component {

  getInputStyle() {
    return {
      container: styles.inputWrapper,
      input: classNaming(styles.inputText, { [styles.inputError]: this.props.isError }),
      notes: styles.inputNotes,
    };
  }

  render() {
    const inputStyle = this.getInputStyle();
    return (
      <Input
        {...this.props} styles={inputStyle}
        className={inputStyle.input}
      />
    );
  }
}

LoginInput.propTypes = {
  isError: PropTypes.bool,
};

LoginInput.defaultProps = {
  isError: false,
};
