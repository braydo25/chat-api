const ConversationModel = rootRequire('/models/ConversationModel');
const ConversationMessageModel = rootRequire('/models/ConversationMessageModel');
const ConversationUserModel = rootRequire('/models/ConversationUserModel');

const UserModel = rootRequire('/models/UserModel');

ConversationModel.hasMany(ConversationMessageModel);
ConversationModel.hasMany(ConversationUserModel);

ConversationMessageModel.belongsTo(UserModel);
ConversationUserModel.belongsTo(UserModel);

module.exports = database.sync({ force: true });
