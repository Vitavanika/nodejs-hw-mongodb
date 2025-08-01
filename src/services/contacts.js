import { Contact } from '../models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { savePhotoToCloudinary } from './cloudinary.js';

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

export const createContact = async (payload, userId, file) => {
  const photoUrl = await savePhotoToCloudinary(file);
  return Contact.create({ ...payload, userId, photo: photoUrl });
};

export const deleteContact = async (contactId, userId) =>
  Contact.findOneAndDelete({ _id: contactId, userId });

export const updateContact = async (contactId, payload, userId, file) => {
  const photoUrl = await savePhotoToCloudinary(file);
  const updatePayload = photoUrl ? { ...payload, photo: photoUrl } : payload;
  return Contact.findOneAndUpdate({ _id: contactId, userId }, updatePayload, {
    new: true,
  });
};
