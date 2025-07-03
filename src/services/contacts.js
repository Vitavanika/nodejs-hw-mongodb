import { Contact } from '../models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  page,
  perPage,
  sortBy,
  sortOrder,
  contactType,
  isFavourite,
}) => {
  const skip = (page - 1) * perPage;
  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  }
  const filter = {};
  if (contactType) {
    filter.contactType = contactType;
  }
  if (isFavourite !== undefined) {
    filter.isFavourite = isFavourite === 'true';
  }
  const totalItems = await Contact.countDocuments(filter);
  const contacts = await Contact.find(filter)
    .skip(skip)
    .limit(perPage)
    .sort(sort);
  const paginationData = calculatePaginationData(totalItems, perPage, page);
  return { data: contacts, ...paginationData };
};

export const getContactById = async (contactId) => Contact.findById(contactId);
export const createContact = async (payload) => Contact.create(payload);
export const deleteContact = async (contactId) =>
  Contact.findByIdAndDelete(contactId);
export const updateContact = async (contactId, payload) =>
  Contact.findByIdAndUpdate(contactId, payload, { new: true });
