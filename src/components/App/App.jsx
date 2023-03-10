import { Component } from 'react';
import { nanoid } from 'nanoid';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ContactFrom, Filter, ContactList } from 'components';
import * as api from 'services/api';
import css from './app.module.css';
import initialContacts from 'data/contacts.json';

function sortContacts(contacts) {
  const collator = new Intl.Collator('en', { sensitivity: 'base' }).compare;
  contacts.sort(({ name: a }, { name: b }) => collator(a, b));
  return contacts;
}

export default class App extends Component {
  state = {
    contacts: [],
    filter: '',
  };

  componentDidMount() {
    let contacts = api.restore();
    if (contacts.length === 0) {
      contacts = sortContacts(initialContacts);
    }
    this.setState({ contacts });
  }

  componentDidUpdate(prevProps, { contacts: prevContacts }) {
    const { contacts } = this.state;
    if (contacts !== prevContacts) {
      api.store(contacts);
    }
  }

  handleFilter = filter => {
    this.setState({ filter });
  };

  handleAddContact = contact => {
    const { contacts } = this.state;
    const normalizedName = contact.name.toLocaleLowerCase();

    if (
      contacts.find(({ name }) => name.toLocaleLowerCase() === normalizedName)
    ) {
      toast.error(`${contact.name} is already in contacts.`);
      return false;
    }

    const id = nanoid(8);
    const updatedContacts = sortContacts([{ id, ...contact }, ...contacts]);

    this.setState({ contacts: updatedContacts });
    return true;
  };

  handleDeleteContact = id => {
    this.setState(({ contacts }) => {
      const updatedContacts = contacts.filter(contact => contact.id !== id);
      return { contacts: updatedContacts };
    });
  };

  getFilteredContacts() {
    const { contacts, filter } = this.state;
    if (filter === '') {
      return contacts;
    }

    const normalizedFilter = filter.toLocaleLowerCase();
    return contacts.filter(({ name }) =>
      name.toLocaleLowerCase().includes(normalizedFilter)
    );
  }

  render() {
    const { filter } = this.state;

    const filteredContacts = this.getFilteredContacts();

    return (
      <div className={css.container}>
        <h1 className={css.title}>Phonebook</h1>
        <ContactFrom onAddContact={this.handleAddContact} />

        <h2 className={css.subtitle}>Contacts</h2>
        <Filter value={filter} onChange={this.handleFilter} />

        <ContactList
          contacts={filteredContacts}
          onDelete={this.handleDeleteContact}
        />

        <ToastContainer
          position="top-center"
          autoClose={2000}
          className={css.toast}
        />
      </div>
    );
  }
}
