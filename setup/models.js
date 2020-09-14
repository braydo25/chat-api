const AttachmentModel = rootRequire('/models/AttachmentModel');
const RoomModel = rootRequire('/models/RoomModel');
const RoomMessageModel = rootRequire('/models/RoomMessageModel');
const RoomImpressionModel = rootRequire('/models/RoomImpressionModel');
const RoomMessageAttachmentModel = rootRequire('/models/RoomMessageAttachmentModel');
const RoomMessageEmbedModel = rootRequire('/models/RoomMessageEmbedModel');
const RoomMessageReactionModel = rootRequire('/models/RoomMessageReactionModel');
const RoomRepostModel = rootRequire('/models/RoomRepostModel');
const RoomUserModel = rootRequire('/models/RoomUserModel');
const EmbedModel = rootRequire('/models/EmbedModel');
const UserActivityModel = rootRequire('/models/UserActivityModel');
const UserRoomDataModel = rootRequire('/models/UserRoomDataModel');
const UserDeviceModel = rootRequire('/models/UserDeviceModel');
const UserModel = rootRequire('/models/UserModel');
const UserFollowerModel = rootRequire('/models/UserFollowerModel');

RoomModel.belongsTo(UserModel);
RoomModel.belongsTo(RoomMessageModel, { as: 'previewRoomMessage', constraints: false });
RoomModel.hasMany(RoomImpressionModel);
RoomModel.hasMany(RoomMessageModel);
RoomModel.hasMany(RoomMessageModel, { as: 'pinnedRoomMessages' });
RoomModel.hasMany(RoomUserModel);
RoomModel.hasMany(RoomUserModel, { as: 'previewRoomUsers' });
RoomModel.hasOne(RoomRepostModel, { as: 'authUserRoomRepost', foreignKey: 'roomId' });
RoomModel.hasOne(RoomUserModel, { as: 'authRoomUser', foreignKey: 'roomId' });
RoomModel.hasOne(UserRoomDataModel, { as: 'authUserRoomData', foreignKey: 'roomId' });

RoomMessageModel.belongsToMany(AttachmentModel, { through: RoomMessageAttachmentModel });
RoomMessageModel.belongsToMany(EmbedModel, { through: RoomMessageEmbedModel });
RoomMessageModel.hasMany(RoomMessageReactionModel);
RoomMessageModel.hasMany(RoomMessageReactionModel, { as: 'authUserRoomMessageReactions' });
RoomMessageModel.belongsTo(RoomUserModel);

RoomMessageReactionModel.belongsTo(UserModel);

RoomRepostModel.belongsTo(RoomModel);
RoomRepostModel.belongsTo(UserModel);

RoomUserModel.belongsTo(RoomModel);
RoomUserModel.belongsTo(UserModel);

UserModel.belongsTo(AttachmentModel, { as: 'avatarAttachment' });
UserModel.hasMany(AttachmentModel, { constraints: false });
UserModel.hasMany(RoomModel);
UserModel.hasMany(RoomImpressionModel);
UserModel.hasMany(EmbedModel);
UserModel.hasMany(UserActivityModel);
UserModel.hasMany(UserRoomDataModel);
UserModel.hasMany(UserDeviceModel);
UserModel.hasMany(UserFollowerModel);
UserModel.hasOne(UserFollowerModel, { as: 'authUserFollower', foreignKey: 'userId' });

UserActivityModel.belongsTo(RoomRepostModel);
UserActivityModel.belongsTo(UserFollowerModel);

UserRoomDataModel.belongsTo(RoomModel);

UserDeviceModel.belongsTo(UserModel);

UserFollowerModel.belongsTo(UserModel);
UserFollowerModel.belongsTo(UserModel, { as: 'followerUser' });

module.exports = database.sync({ force: true });
