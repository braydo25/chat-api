/*
 * Route: /devices
 */

const UserDeviceModel = rootRequire('/models/UserDeviceModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');

const router = express.Router({
  mergeParams: true,
});

/*
 * PUT
 */

router.put('/', userAuthorize);
router.put('/', asyncMiddleware(async (request, response) => {
  const userId = request.user.id;
  const { idfv, details, apnsToken, fcmRegistrationId } = request.body;

  if (!idfv) {
    throw new Error('idfv must be provided.');
  }

  const existingUserDevice = await UserDeviceModel.findOne({ where: { idfv } });

  if (existingUserDevice) {
    existingUserDevice.userId = userId;
    existingUserDevice.details = details || existingUserDevice.details;
    existingUserDevice.apnsToken = (apnsToken !== undefined) ? apnsToken : existingUserDevice.apnsToken;
    existingUserDevice.fcmRegistrationId = (fcmRegistrationId !== undefined) ? fcmRegistrationId : existingUserDevice.fcmRegistrationId;

    await existingUserDevice.save();
  } else {
    await UserDeviceModel.create({ userId, idfv, details, apnsToken, fcmRegistrationId });
  }

  response.success();
}));

/*
 * Export
 */

module.exports = router;
