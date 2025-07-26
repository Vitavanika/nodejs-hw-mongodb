import { Contact } from '../models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  page,
  perPage,
  sortBy,
  sortOrder,
  contactType,
  isFavourite,
  userId,
}) => {
  const skip = (page - 1) * perPage;
  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  }
  const filter = { userId };
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

export const getContactById = async (contactId, userId) =>
  Contact.findOne({ _id: contactId, userId });
export const createContact = async (payload, userId) =>
  Contact.create({ ...payload, userId });
export const deleteContact = async (contactId, userId) =>
  Contact.findOneAndDelete({ _id: contactId, userId });
export const updateContact = async (contactId, payload, userId) =>
  Contact.findOneAndUpdate({ _id: contactId, userId }, payload, { new: true });
