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
      createdAt: Joi.date(),
      userFollower: Joi.object({
        id: Joi.number(),
        userId: Joi.number(),
        followerUser: Joi.object({
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
      }).optional(),
      roomRepost: Joi.object({
        id: Joi.number(),
        userId: Joi.number(),
        roomId: Joi.number(),
        createdAt: Joi.date(),
        room: Joi.object({
          id: Joi.number(),
          title: Joi.string(),
        }),
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
      }).optional(),
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
