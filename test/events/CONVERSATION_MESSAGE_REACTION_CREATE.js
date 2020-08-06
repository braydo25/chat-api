const Joi = require('@hapi/joi');

/*
 * Validator
 */

module.exports = payload => {
  const validationResult = Joi.object({
    event: Joi.string(),
    data: Joi.object({
      id: Joi.number(),
      conversationMessageId: Joi.number(),
      conversationUserId: Joi.number(),
      reaction: Joi.string(),
    }),
  }).validate(payload, {
    allowUnknown: true,
    presence: 'required',
  });

  if (validationResult.error) {
    console.dir(validationResult, { depth: null });
    throw validationResult.error;
  }
};
