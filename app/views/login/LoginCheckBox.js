import React from 'react'; // eslint-disable-line
import classNaming from 'classnames';
import PropTypes from 'prop-types';

import styles from './styles.scss';
import { CheckBox } from '../base';

export default class LoginCheckBox extends React.Component {

  getCheckBoxStyle() {
    return {
      container: classNaming(styles.checkbox, {
        [styles.checked]: this.props.checked,
      }),
      checkbox: styles.checkboxInput,
      label: styles.checkboxLabel,
    };
  }

  render() {
    const checkBoxStyle = this.getCheckBoxStyle();
    return (
      <CheckBox styles={checkBoxStyle} {...this.props} />
    );
  }
}

LoginCheckBox.propTypes = {
  checked: PropTypes.bool,
};

LoginCheckBox.defaultProps = {
  checked: false,
};
