/*
 * Route: /conversations/:conversationId/messages/conversationMessageId?
 */

const userAuthorize = rootRequire('/middlewares/users/authorize');
const conversationAssociate = rootRequire('/middlewares/conversations/associate');
const conversationMessageAuthorize = rootRequire('/middlewares/conversations/messages/authorize');

const router = express.Router({
  mergeParams: true,
});

/*
 * GET
 */

router.get('/', userAuthorize);
router.get('/', conversationAssociate);
router.get('/', asyncMiddleware(async (request, response) => {
  response.success();
}));

/*
 * POST
 */

router.post('/', userAuthorize);
router.post('/', conversationAssociate);
router.post('/', asyncMiddleware(async (request, response) => {
  response.success();
}));

/*
 * PATCH
 */

router.patch('/', userAuthorize);
router.patch('/', conversationMessageAuthorize);
router.patch('/', asyncMiddleware(async (request, response) => {
  response.success();
}));

/*
 * DELETE
 */

router.delete('/', userAuthorize);
router.delete('/', conversationMessageAuthorize);
router.delete('/', asyncMiddleware(async (request, response) => {
  response.success();
}));

/*
 * Export
 */

module.exports = router;
