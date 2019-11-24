/*
 * Route: /rooms/:roomHashId/channels/:channelHashId?
 */

const userAuthorize = rootRequire('/middlewares/users/authorize');

const router = express.Router({
  mergeParams: true,
});

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', asyncMiddleware(async (request, response) => {
  response.error('todo');
}));

/*
 * PATCH
 */

router.patch('/', userAuthorize);
router.patch('/', asyncMiddleware(async (request, response) => {
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
