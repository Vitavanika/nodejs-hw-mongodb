import {
  getAllContacts as getAllContactsService,
  getContactById as getContactByIdService,
  createContact as createContactService,
  deleteContact as deleteContactService,
  updateContact as updateContactService,
} from '../services/contacts.js';
import createHttpError from 'http-errors';

export const getAllContactsController = async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const perPage = parseInt(req.query.perPage || '10', 10);
  const sortBy = req.query.sortBy || 'name';
  const sortOrder = req.query.sortOrder || 'asc';
  const contactType = req.query.type;
  const isFavourite = req.query.isFavourite;
  const paginationResult = await getAllContactsService({ page, perPage, sortBy, sortOrder, contactType, isFavourite });
  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: paginationResult,
  });
};

export const getContactByIdController = async (req, res) => {
  const { contactId } = req.params;
  const contact = await getContactByIdService(contactId);
  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }
  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  const payload = req.body;
  const contact = await createContactService(payload);
  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: contact,
  });
};

export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;
  const contact = await deleteContactService(contactId);
  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }
  res.status(204).send();
};

export const updateContactController = async (req, res) => {
  const { contactId } = req.params;
  const payload = req.body;
  const contact = await updateContactService(contactId, payload);
  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }
  res.status(200).json({
    status: 200,
    message: 'Successfully updated contact!',
    data: contact,
  });
};
