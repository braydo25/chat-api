/*
 * This controls test execution order.
 */

require('./api/users');
require('./api/users/conversations');
require('./api/users/followers');
require('./api/attachments');
require('./api/conversations');
require('./api/conversations/messages');
require('./api/conversations/typing');
require('./api/conversations/users');
require('./api/embeds');
