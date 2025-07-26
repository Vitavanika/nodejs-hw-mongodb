import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import validateBody from '../middlewares/validateBody.js';
import isValidId from '../middlewares/isValidId.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../validation/contacts.js';
import {
  getAllContactsController,
  getContactByIdController,
  createContactController,
  deleteContactController,
  updateContactController,
} from '../controllers/contacts.js';

const contactsRouter = Router();

contactsRouter.use(authenticate);
contactsRouter.get('/', ctrlWrapper(getAllContactsController));
contactsRouter.get('/:contactId', isValidId, ctrlWrapper(getContactByIdController));
contactsRouter.post(
  '/',
  validateBody(createContactSchema),
  ctrlWrapper(createContactController),
);
contactsRouter.delete('/:contactId', isValidId, ctrlWrapper(deleteContactController));
contactsRouter.patch(
  '/:contactId',
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(updateContactController),
);

export default contactsRouter;
