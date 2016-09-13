import React from 'react';
import _ from 'underscore';
import {Dropdown} from './form';
import styles from './pagination.css';

function PaginationInfo(props) {
  var {limit, total, page} = props;
  var infoString = '';

  if(total == 0) {
    infoString = `Showing 0 entries`;
  } else {
    infoString = `Showing ${(page-1)*limit+1} to ${page*limit > total ? total : page*limit} of ${total} entries`;
  }

  return (
    <span className="pagination-info">{infoString}</span>
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
      <span className="page-list">
        <span className="btn-group dropup">
          <Dropdown opened={this.state.opened} val={this.props.limit} options={[5, 10, 25, 50, 100]} onClick={this.toggleOpened} selectVal={this.setLimit} />
        </span>
        {' records per page'}
      </span>
    );
  }
});

function PaginationDetail(props) {
  var {limit, total, page, setLimit} = props;

  return (
    <div className={styles.paginationDetail}>
      <PaginationInfo limit={limit} total={total} page={page} />
      <LimitSelector limit={limit} setLimit={setLimit} />
    </div>
  );
}

const PaginationControl = React.createClass({
  setPage(x) {
    if(x != this.props.currentPage) this.props.setPage(x);
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

    return (
      <div className={styles.paginationControl}>
        <ul className={styles.paginationItem}>
          <li className="page-first">
            <a href="javascript:;" onClick={this.setPage.bind(this, 1)}>«</a>
          </li>
          <li className="page-pre">
            <a href="javascript:;" onClick={this.setPage.bind(this, currentPage - 1)}>‹</a>
          </li>
          { 
            minPage > 1 ? 
            <li>
              <a href="javascript:;">...</a>
            </li> :
            <li></li>
          }
          {pages}
          { 
            maxPage < 1 + pagesCount ? 
            <li>
              <a href="javascript:;">...</a>
            </li> :
            <li></li>
          }
          <li className="page-next">
            <a href="javascript:;" onClick={this.setPage.bind(this, currentPage + 1)}>›</a>
          </li>
          <li className="page-last">
            <a href="javascript:;" onClick={this.setPage.bind(this, pagesCount)}>»</a>
          </li>
        </ul>
      </div>
    );
  }
});

const Pagination = React.createClass({
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
      <div>
        <div className="fixed-table-pagination" style={{display: 'block'}}>
          <PaginationDetail limit={limit} total={total} page={currentPage} setLimit={this.setLimit} />
          <PaginationControl pagesCount={totalPages} currentPage={currentPage} setPage={this.setPage} />
        </div>
        <div style={{clear: 'both'}} />
      </div>
    );
  }
});

export {Pagination};
