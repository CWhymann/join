import { Contact, ContactGroup } from '../models/contact.model';
import { getInitialLetter } from './avatar.utils';

export function sortContactsByName(contacts: Contact[]): Contact[] {
  return [...contacts].sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

export function groupContactsByLetter(sortedContacts: Contact[]): ContactGroup[] {
  const groups: ContactGroup[] = [];
  for (const contact of sortedContacts) {
    addToGroups(groups, contact);
  }
  return groups;
}

function addToGroups(groups: ContactGroup[], contact: Contact): void {
  const letter = getInitialLetter(contact.name);
  const lastGroup = groups[groups.length - 1];
  if (lastGroup && lastGroup.letter === letter) {
    lastGroup.contacts.push(contact);
    return;
  }
  groups.push({ letter, contacts: [contact] });
}
