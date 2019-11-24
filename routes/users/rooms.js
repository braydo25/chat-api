/*
 * Route: /users/@me/rooms
 */

const userAuthorize = rootRequire('/middlewares/users/authorize');

const router = express.Router({
  mergeParams: true,
});

/*
 * GET
 */

router.get('/', userAuthorize);
router.get('/', asyncMiddleware(async (request, response) => {
  response.error('todo');
}));

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', asyncMiddleware(async (request, response) => {
  response.error('todo');
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', asyncMiddleware(async (request, response) => {
  response.error('todo');
}));

/*
 * Export
 */

module.exports = router;
