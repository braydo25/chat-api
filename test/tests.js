/*
 * This controls test execution order.
 */

require('./api/health');
require('./api/users');
require('./api/users/rooms');
require('./api/rooms');
require('./api/rooms/channels');
require('./api/channels/messages');
require('./api/channels/messages/reactions');
