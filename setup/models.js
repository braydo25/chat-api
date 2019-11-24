const ChannelModel = rootRequire('/models/ChannelModel');
const ChannelMessageModel = rootRequire('/models/ChannelMessageModel');
const ChannelMessageReactionModel = rootRequire('/models/ChannelMessageReactionModel');

const RoomModel = rootRequire('/models/RoomModel');
const RoomUserModel = rootRequire('/models/RoomUserModel');

const UserModel = rootRequire('/models/UserModel');

module.exports = database.sync({ force: true });
