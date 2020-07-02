const AttachmentModel = rootRequire('/models/AttachmentModel');
const ConversationModel = rootRequire('/models/ConversationModel');
const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');
const ConversationImpressionModel = rootRequire('/models/ConversationImpressionModel');
const ConversationMessageAttachmentModel = rootRequire('/models/ConversationMessageAttachmentModel');
const ConversationMessageEmbedModel = rootRequire('/models/ConversationMessageEmbedModel');
const ConversationMessageReactionModel = rootRequire('/models/ConversationMessageReactionModel');
const ConversationUserModel = rootRequire('/models/ConversationUserModel');
const EmbedModel = rootRequire('/models/EmbedModel');
const UserActivityModel = rootRequire('/models/UserActivityModel');
const UserDeviceModel = rootRequire('/models/UserDeviceModel');
const UserModel = rootRequire('/models/UserModel');
const UserFollowerModel = rootRequire('/models/UserFollowerModel');

ConversationModel.belongsTo(UserModel);
ConversationModel.belongsTo(ConversationMessageModel, { as: 'previewConversationMessage', constraints: false });
ConversationModel.hasMany(ConversationImpressionModel);
ConversationModel.hasMany(ConversationMessageModel);
ConversationModel.hasMany(ConversationUserModel);
ConversationModel.hasMany(ConversationUserModel, { as: 'previewConversationUsers' });
ConversationModel.hasOne(ConversationUserModel, { as: 'authConversationUser', foreignKey: 'conversationId' });

ConversationMessageModel.belongsToMany(AttachmentModel, { through: ConversationMessageAttachmentModel });
ConversationMessageModel.belongsToMany(EmbedModel, { through: ConversationMessageEmbedModel });
ConversationMessageModel.hasMany(ConversationMessageReactionModel);
ConversationMessageModel.hasMany(ConversationMessageReactionModel, { as: 'authUserConversationMessageReactions' });
ConversationMessageModel.belongsTo(UserModel);

ConversationMessageReactionModel.belongsTo(UserModel);

ConversationUserModel.belongsTo(ConversationModel);
ConversationUserModel.belongsTo(UserModel);

UserModel.belongsTo(AttachmentModel, { as: 'avatarAttachment' });
UserModel.hasMany(AttachmentModel, { constraints: false });
UserModel.hasMany(ConversationModel);
UserModel.hasMany(EmbedModel);
UserModel.hasMany(UserActivityModel);
UserModel.hasMany(UserDeviceModel);
UserModel.hasMany(UserFollowerModel);
UserModel.hasOne(UserFollowerModel, { as: 'authUserFollower', foreignKey: 'userId' });

UserActivityModel.belongsTo(UserFollowerModel);

UserDeviceModel.belongsTo(UserModel);

UserFollowerModel.belongsTo(UserModel);
UserFollowerModel.belongsTo(UserModel, { as: 'followerUser' });

module.exports = database.sync();
