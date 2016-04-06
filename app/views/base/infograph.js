import React from 'react';
import {Glyph} from './';
import styles from './infograph.css';
import classNaming from 'classnames';

const BoxState = {
  all: {
    styles: styles.attrAll,
    name: 'list-alt'
  },
  booked: {
    styles: styles.attrOpen,
    name: 'tags'
  },
  processed: {
    styles: styles.attrProcessed,
    name: 'map-marker'
  },
  finished: {
    styles: styles.attrFinished,
    name: 'check'
  }
}

export default React.createClass({
  handleClick() {
    this.props.onClick(this.props.attr);
  },
  render() {
    const {attr, val} = this.props;
    const state = BoxState[attr] || {};
    return (
      <div className={classNaming(styles.container, state.styles)} onClick={this.handleClick}>
        <Glyph name={state.name} className={styles.glyph} />
        <span className={styles.num}>{val}</span>
        <span className={styles.attr}>{attr}</span>
      </div>
    );
  }
});
