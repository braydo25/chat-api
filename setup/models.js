const RoomModel = rootRequire('/models/RoomModel');
const RoomChannelModel = rootRequire('/models/RoomChannelModel');
const RoomChannelMessageModel = rootRequire('/models/RoomChannelMessageModel');
const RoomChannelMessageReactionModel = rootRequire('/models/RoomChannelMessageReactionModel');
const RoomUserModel = rootRequire('/models/RoomUserModel');

const UserModel = rootRequire('/models/UserModel');

RoomModel.hasMany(RoomChannelModel);
RoomModel.hasMany(RoomUserModel);
RoomChannelModel.hasMany(RoomChannelMessageModel);
RoomChannelMessageModel.hasMany(RoomChannelMessageReactionModel);
RoomUserModel.belongsTo(RoomModel);

UserModel.hasMany(RoomUserModel);
UserModel.hasMany(RoomChannelMessageModel);
UserModel.hasMany(RoomChannelMessageReactionModel);

module.exports = database.sync({ force: true });
