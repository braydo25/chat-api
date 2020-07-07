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
const UserConversationDataModel = rootRequire('/models/UserConversationDataModel');
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
ConversationModel.hasOne(UserConversationDataModel, { as: 'authUserConversationData', foreignKey: 'conversationId' });


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
UserModel.hasMany(ConversationImpressionModel);
UserModel.hasMany(EmbedModel);
UserModel.hasMany(UserActivityModel);
UserModel.hasMany(UserConversationDataModel);
UserModel.hasMany(UserDeviceModel);
UserModel.hasMany(UserFollowerModel);
UserModel.hasOne(UserFollowerModel, { as: 'authUserFollower', foreignKey: 'userId' });

UserActivityModel.belongsTo(UserFollowerModel);

UserConversationDataModel.belongsTo(ConversationModel);

UserDeviceModel.belongsTo(UserModel);

UserFollowerModel.belongsTo(UserModel);
UserFollowerModel.belongsTo(UserModel, { as: 'followerUser' });

module.exports = database.sync();
