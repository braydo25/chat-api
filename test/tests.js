/*
 * This controls test execution order.
 */

require('./api/health');
require('./api/users');
require('./api/users/rooms');
require('./api/users/rooms/data');
require('./api/users/followers');
require('./api/attachments');
require('./api/rooms');
require('./api/rooms/messages');
require('./api/rooms/messages/reactions');
require('./api/rooms/pins');
require('./api/rooms/reposts');
require('./api/rooms/typing');
require('./api/rooms/users');
require('./api/activity');
require('./api/devices');
require('./api/embeds');
