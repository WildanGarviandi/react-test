import React from 'react';
import _ from 'underscore';
import {Dropdown} from '../views/base';
import styles from './pagination2.css';

function PaginationInfo(props) {
  var {limit, total, page} = props;
  var infoString = `PAGE ${page} / ${Math.ceil(total/limit)}`;

  return (
    <span className={styles.paginationInfo}>
      {infoString}
      <img className={styles.leftArrow} src="/img/icon-previous.png" />
      <img className={styles.rightArrow} src="/img/icon-next.png" />
    </span>
  );
}

const LimitSelector = React.createClass({
  getInitialState() {
    return { opened: false }
  },
  setLimit(x) {
    this.props.setLimit(x);
    this.setState({opened: false});
  },
  toggleOpened() {
    this.setState({opened: !this.state.opened});
  },
  render() {
    return (
      <span className={styles.pageList}>
        <span style={{opacity: 0.5}}>{'Show'}</span>
        <span className="btn-group dropup">
          <Dropdown opened={this.state.opened} val={this.props.limit} options={[5, 10, 25, 50, 100, 200, 500, 1000]} onClick={this.toggleOpened} selectVal={this.setLimit} />
        </span>
        <span style={{opacity: 0.5}}>{' per page'}</span>
      </span>
    );
  }
});

function PaginationDetail(props) {
  var {limit, total, page, setLimit} = props;

  return (
    <div className={styles.paginationDetail}>
      <LimitSelector limit={limit} setLimit={setLimit} />
    </div>
  );
}
  
const PaginationControl = React.createClass({
  setPage(x) {
    if(x != this.props.currentPage && x >= 1 && x <= this.props.pagesCount) this.props.setPage(x);
  },
  render() {
    var {pagesCount, currentPage} = this.props;
    var minPage = Math.max(1, currentPage - 3);
    var maxPage = Math.min(pagesCount + 1, currentPage + 4);
    var pages = _.map(_.range(minPage, maxPage), (x) => {
      return (
        <li key={x} className={ x == currentPage ? styles.paginationActive : ""}>
          <a href="javascript:;" onClick={this.setPage.bind(this, x)}>{x}</a>
        </li>
      );
    });

    const infoString = `PAGE ${currentPage} / ${pagesCount}`;

    return (
      <div className={styles.paginationControl}>
        <span className={styles.paginationInfo}>
          {infoString}
          <img className={styles.leftArrow} onClick={this.setPage.bind(this, currentPage - 1)} src="/img/icon-previous.png" />
          <img className={styles.rightArrow} onClick={this.setPage.bind(this, currentPage + 1)} src="/img/icon-next.png" />
        </span>
      </div>
    );
  }
});

const Pagination2 = React.createClass({
  countPages() {
    return Math.ceil(this.props.total / this.props.limit);
  },
  setLimit(x) {
    let {setLimit} = this.props;
    if(!setLimit) return;
    setLimit(x);
  },
  setPage(x) {
    let {setCurrentPage} = this.props;
    if(!setCurrentPage) return;

    x = Math.max(1, Math.min(x, this.countPages()));
    this.props.setCurrentPage(x);
  },
  render() {
    var {limit, total, currentPage} = this.props;
    var totalPages = this.countPages();

    return (
      <div className={styles.paginationTable}>
        <div style={{display: 'block'}}>
          <PaginationControl pagesCount={totalPages} currentPage={currentPage} setPage={this.setPage} />
          <PaginationDetail limit={limit} total={total} page={currentPage} setLimit={this.setLimit} />
        </div>
        <div style={{clear: 'both', marginBottom: 10}} />
      </div>
    );
  }
});

export {Pagination2};
