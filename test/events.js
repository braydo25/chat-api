const fs = require('fs');

const events = fs.readdirSync('./test/events').map(eventFileName => {
  return eventFileName.replace('.js', '');
});

const eventValidators = events.reduce((eventValidators, event) => {
  eventValidators[event] = require(`./events/${event}`);

  return eventValidators;
}, {});

module.exports.testPayload = payload => {
  const payloadObject = JSON.parse(payload.toString());

  if (!events.includes(payloadObject.event)) {
    throw new Error(`Unknown event ${payloadObject.event}`);
  }

  eventValidators[payloadObject.event](payloadObject);
};
