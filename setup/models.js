const AttachmentModel = rootRequire('/models/AttachmentModel');
const ConversationModel = rootRequire('/models/ConversationModel');
const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');
const ConversationUserModel = rootRequire('/models/ConversationUserModel');
const EmbedModel = rootRequire('/models/EmbedModel');
const UserModel = rootRequire('/models/UserModel');

ConversationModel.belongsTo(UserModel);
ConversationModel.hasMany(ConversationMessageModel);
ConversationModel.hasMany(ConversationUserModel);

ConversationMessageModel.belongsToMany(AttachmentModel, { through: 'conversationMessageAttachments' });
ConversationMessageModel.belongsToMany(EmbedModel, { through: 'conversationMessageEmbeds' });
ConversationMessageModel.belongsTo(UserModel);

ConversationUserModel.belongsTo(ConversationModel);
ConversationUserModel.belongsTo(UserModel);

module.exports = database.sync({ force: true });
