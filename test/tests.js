/*
 * This controls test execution order.
 */

require('./api/health');
require('./api/users');
require('./api/users/conversations');
require('./api/users/conversations/data');
require('./api/users/followers');
require('./api/attachments');
require('./api/conversations');
require('./api/conversations/messages');
require('./api/conversations/messages/reactions');
require('./api/conversations/pins');
require('./api/conversations/reposts');
require('./api/conversations/typing');
require('./api/conversations/users');
require('./api/activity');
require('./api/devices');
require('./api/embeds');
