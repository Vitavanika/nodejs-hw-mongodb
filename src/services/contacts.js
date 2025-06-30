import { Contact } from '../models/contact.js';

export const getAllContacts = async () => Contact.find();
export const getContactById = async (contactId) => Contact.findById(contactId);
export const createContact = async (payload) => Contact.create(payload);
export const deleteContact = async (contactId) => Contact.findByIdAndDelete(contactId);