/*
 * This controls test execution order.
 */

require('./api/users');
require('./api/users/conversations');
require('./api/users/conversations/data');
require('./api/users/followers');
require('./api/attachments');
require('./api/conversations');
require('./api/conversations/messages');
require('./api/conversations/messages/reactions');
require('./api/conversations/reposts');
require('./api/conversations/typing');
require('./api/conversations/users');
require('./api/devices');
require('./api/embeds');
