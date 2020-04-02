const AttachmentModel = rootRequire('/models/AttachmentModel');
const ConversationModel = rootRequire('/models/ConversationModel');
const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');
const ConversationMessageAttachmentModel = rootRequire('/models/ConversationMessageAttachmentModel');
const ConversationMessageEmbedModel = rootRequire('/models/ConversationMessageEmbedModel');
const ConversationUserModel = rootRequire('/models/ConversationUserModel');
const EmbedModel = rootRequire('/models/EmbedModel');
const UserModel = rootRequire('/models/UserModel');

ConversationModel.belongsTo(UserModel);
ConversationModel.hasMany(ConversationMessageModel);
ConversationModel.hasMany(ConversationUserModel);

ConversationMessageModel.belongsToMany(AttachmentModel, { through: ConversationMessageAttachmentModel });
ConversationMessageModel.belongsToMany(EmbedModel, { through: ConversationMessageEmbedModel });
ConversationMessageModel.belongsTo(UserModel);

ConversationUserModel.belongsTo(ConversationModel);
ConversationUserModel.belongsTo(UserModel);

UserModel.hasMany(AttachmentModel);
UserModel.hasMany(ConversationModel);
UserModel.hasMany(EmbedModel);

module.exports = database.sync({ force: true });
