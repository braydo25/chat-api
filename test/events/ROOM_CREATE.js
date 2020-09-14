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
      eventsTopic: Joi.string(),
      accessLevel: Joi.string(),
      title: Joi.string().allow(null).optional(),
      impressionsCount: Joi.number(),
      usersCount: Joi.number(),
      updatedAt: Joi.date(),
      createdAt: Joi.date(),
      authRoomUser: Joi.object({
        id: Joi.number(),
        userId: Joi.number(),
        roomId: Joi.number(),
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
      previewRoomMessage: Joi.object({
        id: Joi.number(),
        text: Joi.string().allow(null).optional(),
        createdAt: Joi.date(),
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
        roomUser: Joi.object({
          id: Joi.number(),
          userId: Joi.number(),
          roomId: Joi.number(),
          permissions: Joi.array().items(Joi.string()),
          createdAt: Joi.date(),
          updatedAt: Joi.date(),
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
      previewRoomUsers: Joi.array().items(Joi.object({
        id: Joi.number(),
        userId: Joi.number(),
        roomId: Joi.number(),
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
      })),
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
  }).validate(payload, {
    allowUnknown: true,
    presence: 'required',
  });

  if (validationResult.error) {
    console.dir(validationResult, { depth: null });
    throw validationResult.error;
  }
};
