/*
 * Route: /health
 */

const router = express.Router({
  mergeParams: true,
});

/*
 * GET
 */

router.get('/', (request, response) => {
  response.success('OK');
});

/*
 * Export
 */

module.exports = router;
