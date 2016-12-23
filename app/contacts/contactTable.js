import lodash from 'lodash';
import React from 'react';
import DateTime from 'react-datetime';
import {connect} from 'react-redux';
import moment from 'moment';
import * as Table from '../components/table';
import styles from '../components/table.css';
import * as ContactService from './contactService';
import OrderStatusSelector from '../modules/orderStatus/selector';
import {Glyph} from '../views/base';
import {Link} from 'react-router';
import {CheckboxHeader as CheckboxHeaderBase, CheckboxCell} from '../views/base/tableCell';

function StoreBuilder(keyword) {
    return (store) => {
        const {filters} = store.app.myContacts;

        return {
            value: filters[keyword],
        }
    }    
}

function DispatchBuilder(keyword) {
    return (dispatch) => {
        function OnChange(e) {
            const newFilters = {[keyword]: e.target.value};
            dispatch(ContactService.UpdateFilters(newFilters));
        }

        function OnKeyDown(e) {
            if(e.keyCode !== 13) {
                return;
            }

            dispatch(ContactService.SetCurrentPage(1));
            dispatch(ContactService.FetchList());
        }

        return {
            onChange: OnChange, 
            onKeyDown: OnKeyDown,
        }
    }
}

function DateTimeDispatch(dispatch) {
    return {
        onChange: function(date) {
            dispatch(ContactService.SetCreatedDate(date));
        }
    }
}

function DropdownStoreBuilder(name) {
    return (store) => {

        const options = {
            "statusName": OrderStatusSelector.GetList(store)
        }

        return {
            value: store.app.myContacts[name],
            options: options[name]
        }
    }
}

function DropdownDispatchBuilder(filterKeyword) {
    return (dispatch) => {
        return {
            handleSelect: (selectedOption) => {
                const SetFn = ContactService.SetDropDownFilter(filterKeyword);
                dispatch(ContactService.SetCurrentPage(1));
                dispatch(SetFn(selectedOption));
            }
        }
    }
}

function CheckboxDispatch(dispatch, props) {
    return {
        onToggle: () => {
            dispatch(ContactService.ToggleChecked(props.contactID));
        }
    }
}

function CheckboxHeaderStore(store) {
    return {
        isChecked: store.app.myContacts.selectedAll,
    }
}

function CheckboxHeaderDispatch(dispatch) {
    return {
        onToggle: () => {
            dispatch(ContactService.ToggleCheckedAll());
        }
    }
}

function DateRangeBuilder(keyword) {
    return (store) => {
        const {filters} = store.app.myContacts;
        return {
            startDate: filters['start' + keyword],
            endDate: filters['end' + keyword],
        }
    }
}

function DateRangeDispatch(keyword) {
    return (dispatch) => {
        return {
            onChange: (event, picker) => {
                const newFilters = {
                    ['start' + keyword]: picker.startDate,
                    ['end' + keyword]: picker.endDate
                }
                dispatch(ContactService.SetCurrentPage(1));
                dispatch(ContactService.UpdateAndFetch(newFilters))
            }
        }
    }
}

function ConnectBuilder(keyword) {
    return connect(StoreBuilder(keyword), DispatchBuilder(keyword));
}

function ConnectDropdownBuilder(keyword) {
    return connect(DropdownStoreBuilder(keyword), DropdownDispatchBuilder(keyword));
}

const NameFilter = ConnectBuilder('contactName')(Table.InputCell);
const PhoneFilter = ConnectBuilder('phone')(Table.InputCell);
const EmailFilter = ConnectBuilder('email')(Table.InputCell);
const CheckboxHeader = connect(CheckboxHeaderStore, CheckboxHeaderDispatch)(CheckboxHeaderBase);
const CheckboxRow = connect(undefined, CheckboxDispatch)(CheckboxCell);

function ContactParser(contact) {

    return lodash.assign({}, contact, {
        IsChecked: ('IsChecked' in contact) ? contact.IsChecked : false,
        Name: contact.FirstName + ' ' + contact.LastName,
        Mobile: contact.Phone,
        Address: (contact.State) ? contact.Street + ' ' + contact.City + ' ' + contact.State.Name : contact.Street + ' ' + contact.City,
    })
}

function ContactHeader() {
    return (
        <tr className={styles.tr}>
            <CheckboxHeader />
            <Table.TextHeader />
            <Table.TextHeader text="Name" />
            <Table.TextHeader text="Email" />
            <Table.TextHeader text="Mobile" />
            <Table.TextHeader text="Address" />
        </tr>
    );
}

function ContactFilter() {
    return (
        <tr className={styles.tr}>
            <Table.EmptyCell />
            <Table.EmptyCell />
            <NameFilter />
            <EmailFilter/>
            <PhoneFilter />
            <Table.EmptyCell />
        </tr>
    )
}
 
function ContactRow({contact}) {
    return (
        <tr className={styles.tr + (contact.IsChecked && (' ' + styles.selected))}>
            <td><CheckboxRow isChecked={contact.IsChecked} contactID={contact.ContactID} /></td>
            <td>
                <Link title='View Details' to={'/mycontacts/edit/' + contact.ContactID} className={styles.linkMenu}>
                    {<Glyph name={'search'}/>}
                </Link>
            </td>
            <Table.TextCell text={contact.Name} />
            <Table.TextCell text={contact.Email} />
            <Table.TextCell text={contact.Mobile} />
            <Table.TextCell text={contact.Address} />
        </tr>
    );
}

function ContactTable({contacts}) {
  const headers = <ContactHeader />;
  const body = lodash.map(contacts, (contact) => {
    return <ContactRow key={contact.ContactID} contact={ContactParser(contact)} />
  });

  return (
    <table className={styles.table}>
      <thead>{headers}</thead>
      <tbody>{body}</tbody>
    </table>
  );
}

export default ContactTable;