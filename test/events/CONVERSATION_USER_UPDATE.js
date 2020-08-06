const Joi = require('@hapi/joi');

/*
 * Validator
 */

module.exports = payload => {
  const validationResult = Joi.object({
    event: Joi.string(),
    data: Joi.object({
      id: Joi.number(),
      userId: Joi.number(),
      conversationId: Joi.number(),
      permissions: Joi.array().items(Joi.string()),
      updatedAt: Joi.date(),
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
