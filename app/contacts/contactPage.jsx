import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Page} from '../components/page';
import {Pagination} from '../components/pagination';
import {ButtonWithLoading} from '../components/button';
import Table from './contactTable';
import * as ContactService from './contactService';
import styles from './styles.scss';
import stylesButton from '../components/button.scss';

const ContactPage = React.createClass({
    componentWillMount() {
        this.props.FetchList()
    },
    render() {
        const {paginationState, PaginationAction, contacts} = this.props;
        return (
            <Page title="My Contact">
                <Pagination {...paginationState} {...PaginationAction} />
                <p>
                    <Link to={'/mycontacts/add'}>
                        <button className={stylesButton.greenButton}>Add Contact</button> 
                    </Link>
                </p>
                <Table contacts={contacts} />
                <Pagination {...paginationState} {...PaginationAction} />
            </Page>
        );
    }
});

function StoreToContactsPage(store) {
    const {currentPage, limit, total, contacts} = store.app.myContacts;
    return {
        contacts: contacts,
        paginationState: {
            currentPage, limit, total,
        },
    }
}

function DispatchToContactsPage(dispatch) {
    return {
        FetchList: () => {
            dispatch(ContactService.FetchList());
        },
        PaginationAction: {
            setCurrentPage: (currentPage) => {
                dispatch(ContactService.SetCurrentPage(currentPage));
            },
            setLimit: (limit) => {
                dispatch(ContactService.SetLimit(limit));
            },
        }
    }
}

export default connect(StoreToContactsPage, DispatchToContactsPage)(ContactPage);