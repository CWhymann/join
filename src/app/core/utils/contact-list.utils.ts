import { Contact, ContactGroup } from '../models/contact.model';
import { getInitialLetter } from './avatar.utils';

/**
 * Sorts contacts by name using German collation.
 * @param contacts - Contacts in any order.
 * @returns New sorted array; the input is left untouched.
 */
export function sortContactsByName(contacts: Contact[]): Contact[] {
  return [...contacts].sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

/**
 * Groups sorted contacts under their initial letter.
 * @param sortedContacts - Contacts already sorted by name.
 * @returns One group per letter, in the order they appear.
 */
export function groupContactsByLetter(sortedContacts: Contact[]): ContactGroup[] {
  const groups: ContactGroup[] = [];
  for (const contact of sortedContacts) {
    addToGroups(groups, contact);
  }
  return groups;
}

/**
 * Appends a contact to the last group or opens a new one.
 * @param groups - Groups collected so far; mutated in place.
 * @param contact - Contact to file.
 */
function addToGroups(groups: ContactGroup[], contact: Contact): void {
  const letter = getInitialLetter(contact.name);
  const lastGroup = groups[groups.length - 1];
  if (lastGroup && lastGroup.letter === letter) {
    lastGroup.contacts.push(contact);
    return;
  }
  groups.push({ letter, contacts: [contact] });
}
