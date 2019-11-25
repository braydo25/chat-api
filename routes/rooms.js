/*
 * Route: /rooms
 */

const RoomModel = rootRequire('/models/RoomModel');
const RoomChannelModel = rootRequire('/models/RoomChannelModel');
const RoomUserModel = rootRequire('/models/RoomUserModel');
const userAuthorize = rootRequire('/middlewares/users/authorize');
const roomPermissionsAuthorize = rootRequire('/middlewares/rooms/permissionsAuthorize');

const router = express.Router({
  mergeParams: true,
});

/*
 * GET
 */

router.get('/', userAuthorize);
router.get('/', asyncMiddleware(async (request, response) => {
  const { search } = request.query;
  const where = (search) ? {
    [ Sequelize.Op.or ]: {
      name: { [ Sequelize.Op.like ]: `%${search}%` },
      description: { [ Sequelize.Op.like ]: `%${search}%` },
    },
  } : null;

  const rooms = await RoomModel.findAll({
    where,
    order: [ [ 'updatedAt', 'DESC' ] ],
  });

  response.success(rooms);
}));

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', asyncMiddleware(async (request, response) => {
  const { user } = request;
  const { name, description } = request.body;

  if (!name) {
    throw new Error('A name must be provided.');
  }

  const transaction = await database.transaction();

  try {
    const room = await RoomModel.create({
      name,
      description,
    }, { transaction });

    await RoomChannelModel.create({
      roomId: room.id,
      name: 'general',
      description: 'Talk about anything and everything.',
    }, { transaction });

    await RoomUserModel.create({
      roomId: room.id,
      userId: user.id,
      permissions: [ 'ADMIN' ],
    }, { transaction });

    await transaction.commit();

    response.success(room);
  } catch(error) {
    transaction.rollback();

    throw error;
  }
}));

/*
 * PATCH
 */

router.patch('/', userAuthorize);
router.patch('/', roomPermissionsAuthorize([ 'ADMIN' ]));
router.patch('/', asyncMiddleware(async (request, response) => {
  const { room } = request;

  room.name = request.body.name || room.name;
  room.description = request.body.description || room.description;

  await room.save();

  response.success(room);
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', roomPermissionsAuthorize([ 'ADMIN' ]));
router.delete('/', asyncMiddleware(async (request, response) => {
  const { room } = request;

  await room.destroy();

  response.success();
}));

/*
 * Export
 */

module.exports = router;
