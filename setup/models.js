const AttachmentModel = rootRequire('/models/AttachmentModel');
const ConversationModel = rootRequire('/models/ConversationModel');
const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');
const ConversationMessageAttachmentModel = rootRequire('/models/ConversationMessageAttachmentModel');
const ConversationMessageEmbedModel = rootRequire('/models/ConversationMessageEmbedModel');
const ConversationMessageReactionModel = rootRequire('/models/ConversationMessageReactionModel');
const ConversationUserModel = rootRequire('/models/ConversationUserModel');
const EmbedModel = rootRequire('/models/EmbedModel');
const UserModel = rootRequire('/models/UserModel');
const UserFollowerModel = rootRequire('/models/UserFollowerModel');

ConversationModel.belongsTo(UserModel);
ConversationModel.belongsTo(ConversationMessageModel, { as: 'previewConversationMessage', constraints: false });
ConversationModel.hasMany(ConversationMessageModel);
ConversationModel.hasMany(ConversationUserModel);

ConversationMessageModel.belongsToMany(AttachmentModel, { through: ConversationMessageAttachmentModel });
ConversationMessageModel.belongsToMany(EmbedModel, { through: ConversationMessageEmbedModel });
ConversationMessageModel.hasMany(ConversationMessageReactionModel);
ConversationMessageModel.belongsTo(UserModel);

ConversationMessageReactionModel.belongsTo(UserModel);

ConversationUserModel.belongsTo(ConversationModel);
ConversationUserModel.belongsTo(UserModel);

UserModel.belongsTo(AttachmentModel, { as: 'avatarAttachment' });
UserModel.hasMany(AttachmentModel, { constraints: false });
UserModel.hasMany(ConversationModel);
UserModel.hasMany(EmbedModel);
UserModel.hasMany(UserFollowerModel);

UserFollowerModel.belongsTo(UserModel);
UserFollowerModel.belongsTo(UserModel, { as: 'followerUser' });

module.exports = database.sync();
