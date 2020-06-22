const awsIot = require('aws-iot-device-sdk');
const { v1: uuidV1 }  = require('uuid');
const awsConfig = rootRequire('/config/aws');

const mqttConnection = awsIot.device({
  caPath: './certificates/AmazonRootCA1.pem',
  certPath: './certificates/publisher-certificate.pem.crt',
  keyPath: './certificates/publisher-private.pem.key',
  clientId: `server-${uuidV1()}`,
  host: awsConfig.iotEndpoint,
});

mqttConnection.on('connect', connack => {
  console.log('EVENTS: Ready');
  console.log(connack);
  console.log('--');
});

mqttConnection.on('reconnect', () => {
  console.log('EVENTS: Reconnected');
});

mqttConnection.on('packetsend', packet => {
  console.log('EVENTS: Packet sent');
  console.log(packet);
  console.log('--');
});

mqttConnection.on('error', error => {
  console.log('EVENTS: Error');
  console.log(error);
  console.log('--');
});


function publishEvent(topic, name, data) {
  mqttConnection.publish(topic, JSON.stringify({ event: name, data }), { qos: 1 });
}

module.exports = { publishEvent };
