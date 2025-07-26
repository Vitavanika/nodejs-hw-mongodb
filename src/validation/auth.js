import Joi from 'joi';

export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    'string.base': 'Name should be a string',
    'string.min': 'Name should have a minimum length of {#limit}',
    'string.max': 'Name should have a maximum length of {#limit}',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.base': 'Email should be a string',
    'string.email': 'Email should be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': 'Password should be a string',
    'string.min': 'Password should have a minimum length of {#limit}',
    'any.required': 'Password is required',
  }),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.base': 'Email should be a string',
    'string.email': 'Email should be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': 'Password should be a string',
    'string.min': 'Password should have a minimum length of {#limit}',
    'any.required': 'Password is required',
  }),
});
