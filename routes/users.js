/*
 * Route: /users
 */

const bcrypt = require('bcrypt');
const UserModel = rootRequire('/models/UserModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');

const router = express.Router({
  mergeParams: true,
});

/*
 * POST
 */

router.post('/', asyncMiddleware(async (request, response) => {
  const { username, password } = request.body;

  if (!username || !password) {
    throw new Error('A username and password must be provided.');
  }

  const existingUser = await UserModel.findOne({ where: { username } });

  if (!existingUser) {
    const user = await UserModel.create({
      username,
      password: await bcrypt.hash(request.body.password, 10),
    });

    return response.success(user);
  }

  if (!await bcrypt.compare(password, existingUser.password)) {
    return response.respond(401, 'Incorrect password.');
  }

  return response.success(existingUser);
}));

/*
 * PATCH
 */

router.patch('/', userAuthorize);
router.patch('/', asyncMiddleware(async (request, response) => {
  const { user, files } = request;

  user.password = (request.body.password) ? await bcrypt.hash(request.body.password, 10) : user.password;
  user.name = request.body.name || user.name;

  await user.save();

  response.success(user);
}));

/*
 * Export
 */

module.exports = router;
