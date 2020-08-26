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
      user: Joi.object({
        id: Joi.number(),
        username: Joi.string().allow(null),
        name: Joi.string().allow(null),
        lastActiveAt: Joi.date(),
        avatarAttachment: Joi.object({
          id: Joi.number(),
          url: Joi.string(),
          mimetype: Joi.string(),
        }).allow(null),
      }),
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
