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
  const { details, apnsToken, fcmRegistrationId } = request.body;

  if (!details || (!apnsToken && !fcmRegistrationId) ) {
    throw new Error('Details and a apnsToken or fcmRegistrationId must be provided.');
  }

  const options = (apnsToken) ? { where: { apnsToken } } : { where: { fcmRegistrationId } };
  const userDevice = await UserDeviceModel.findOne(options);

  if (userDevice) {
    userDevice.userId = userId;
    userDevice.details = details;

    await userDevice.save();
  } else {
    await UserDeviceModel.create({ userId, details, apnsToken, fcmRegistrationId });
  }

  response.success();
}));

/*
 * Export
 */

module.exports = router;
