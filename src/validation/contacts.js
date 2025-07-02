import Joi from 'joi';

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    'string.base': 'Name should be a string',
    'string.min': 'Name should have a minimum length of {#limit}',
    'string.max': 'Name should have a maximum length of {#limit}',
    'any.required': 'Name is required',
  }),
  phoneNumber: Joi.string()
    .pattern(/^\+?[\d\-()]{7,20}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number should be a valid format',
      'string.empty': 'Phone number cannot be empty',
    }),
  email: Joi.string().email().messages({
    'string.base': 'Email should be a string',
    'string.email': 'Email should be a valid email address',
  }),
  isFavourite: Joi.boolean().default(false),
  contactType: Joi.string()
    .valid('work', 'home', 'personal')
    .required()
    .default('personal')
    .messages({
      'string.base': 'Contact type should be a string',
      'any.only': 'Contact type must be one of {#valids}',
    }),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(30).messages({
    'string.base': 'Name should be a string',
    'string.min': 'Name should have a minimum length of {#limit}',
    'string.max': 'Name should have a maximum length of {#limit}',
  }),
  phoneNumber: Joi.string().pattern(/^\+?[\d\-()]{7,20}$/),
  email: Joi.string().email().messages({
    'string.base': 'Email should be a string',
    'string.email': 'Email should be a valid email address',
  }),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid('work', 'home', 'personal'),
}).min(1);
