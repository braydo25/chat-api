const Joi = require('@hapi/joi');

/*
 * Validator
 */

module.exports = payload => {
  const validationResult = Joi.object({
    event: Joi.string(),
    data: Joi.object({
      id: Joi.number(),
      text: Joi.string().allow(null).optional(),
      updatedAt: Joi.date(),
      attachments: Joi.array().items(Joi.object({
        id: Joi.number(),
        filename: Joi.string(),
        bytes: Joi.number(),
        url: Joi.string(),
        mimetype: Joi.string(),
      })),
      embeds: Joi.array().items(Joi.object({
        id: Joi.number(),
        title: Joi.string().allow(null),
        description: Joi.string().allow(null),
        language: Joi.string().allow(null),
        author: Joi.string().allow(null),
        publisher: Joi.string().allow(null),
        date: Joi.date().allow(null),
        mimetype: Joi.string().allow(null),
        url: Joi.string().allow(null),
        logoUrl: Joi.string().allow(null),
        audioUrl: Joi.string().allow(null),
        imageUrl: Joi.string().allow(null),
        videoUrl: Joi.string().allow(null),
      })),
      conversationUser: Joi.object({
        id: Joi.number(),
        userId: Joi.number(),
        conversationId: Joi.number(),
        permissions: Joi.array().items(Joi.string()),
        user: Joi.object({
          id: Joi.number(),
          username: Joi.string(),
          name: Joi.string(),
          lastActiveAt: Joi.date(),
          avatarAttachment: Joi.object({
            id: Joi.number(),
            url: Joi.string(),
            mimetype: Joi.string(),
          }).allow(null),
        }),
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
