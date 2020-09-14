/*
 * Import Environment variables
 */

require('dotenv').config();

/*
 * Dependencies
 */

const fs = require('fs');
const awsIot = require('aws-iot-device-sdk');
const { v1: uuidV1 }  = require('uuid');
const events = require('./events');

/*
 * Set Globals
 */

global.chai = require('chai');
global.chaiHttp = require('chai-http');
global.server = `http://localhost:${process.env.PORT}`;

global.enableTestResponseLogging = true;

global.testUserOne = {
  phone: 15555555555,
  name: 'Yolo Bolo',
  username: 'yolobolo',
};

global.testUserTwo = {
  phone: 16666666666,
  name: 'Ralph Lauren',
  username: 'ralphlauren',
};

global.testUserThree = {
  phone: 18888888888,
  name: 'Lang Spay',
  username: 'lang',
};

global.testUserFour = {
  phone: 19999999999,
  name: 'Larry',
  username: '@larry',
};

global.testRoomOne = {
  accessLevel: 'public',
  title: 'This is a wendys',
  message: {
    text: 'Sir, this is a wendys',
    nonce: 'abcdefg',
  },
};

global.testRoomTwo = {
  accessLevel: 'private',
  message: {
    text: 'testing private',
    nonce: 'aiwdaiwjd',
  },
  userIds: [ 1 ],
};

global.testRoomThree = {
  accessLevel: 'public',
  title: 'Just testing this out',
  message: {
    text: 'testing public',
    nonce: '777wdahwd',
  },
  userIds: [ 1 ],
};

global.testRoomOneUserOne = {};

global.testRoomOneMessageOne = {
  text: 'This is a test',
  nonce: '73773711',
};

global.testRoomOneMessageOneReactionOne = {
  reaction: '🐻',
};

global.testRoomOneRepostOne = {};

global.testPermissionsPublicRoom = {
  accessLevel: 'public',
  title: 'Lets talk public convo',
  message: {
    text: 'this is a public convo!',
    nonce: '8441hfaiheu3',
  },
  userIds: [ 1, 2, 3 ],
};
global.testPermissionsPublicRoomMessageOne = {};
global.testPermissionsPublicRoomAdminUser = {};
global.testPermissionsPublicRoomGeneralUser = {};
global.testPermissionsPublicRoomPermissionlessUser = {};
global.testPermissionsPublicRoomAdminRoomUser = {};
global.testPermissionsPublicRoomGeneralRoomUser = {};
global.testPermissionsPublicRoomPermissionlessRoomUser = {};

global.testPermissionsProtectedRoom = {
  accessLevel: 'protected',
  title: 'Testing protected convos',
  message: {
    text: 'this is a protected convo!',
    nonce: 'b3ufb37f1038',
  },
  userIds: [ 1, 2, 3 ],
};
global.testPermissionsProtectedRoomMessageOne = {};
global.testPermissionsProtectedRoomAdminUser = {};
global.testPermissionsProtectedRoomGeneralUser = {};
global.testPermissionsProtectedRoomPermissionlessUser = {};
global.testPermissionsProtectedRoomAdminRoomUser = {};
global.testPermissionsProtectedRoomGeneralRoomUser = {};
global.testPermissionsProtectedRoomPermissionlessRoomUser = {};

global.testPermissionsPrivateRoom = {
  accessLevel: 'private',
  message: {
    text: 'this is a private convo!',
    nonce: '0199191',
  },
  userIds: [ 1, 2, 3 ],
};
global.testPermissionsPrivateRoomMessageOne = {};
global.testPermissionsPrivateRoomAdminUser = {};
global.testPermissionsPrivateRoomGeneralUser = {};
global.testPermissionsPrivateRoomPermissionlessUser = {};
global.testPermissionsPrivateRoomAdminRoomUser = {};
global.testPermissionsPrivateRoomGeneralRoomUser = {};
global.testPermissionsPrivateRoomPermissionlessRoomUser = {};

global.testAttachmentOne = {};
global.testEmbedOne = { url: 'https://www.youtube.com/watch?v=ac8lSE-7Jqs' };

global.mqttConnection = awsIot.device({
  caPath: './certificates/AmazonRootCA1.pem',
  certPath: './certificates/publisher-certificate.pem.crt',
  keyPath: './certificates/publisher-private.pem.key',
  clientId: `server-${uuidV1()}`,
  host: process.env.AWS_IOT_ENDPOINT,
});

/*
 * Configure Chai
 */

chai.should();
chai.use(chaiHttp);

/*
 * Setup Test Environment
 */

const waitPort = require('wait-port');
const Sequelize = require('sequelize');
const {
  MYSQL_DATABASE,
  MYSQL_USERNAME,
  MYSQL_PASSWORD,
  MYSQL_WRITE_HOST,
  MYSQL_PORT,
} = process.env;

before(done => {
  (async () => {
    fatLog('Waiting for MQTT Connection...');
    await new Promise(resolve => {
      mqttConnection.on('connect', () => {
        console.log('MQTT Connected!');
        resolve();
      });
    });

    fatLog('Setting up MQTT event handlers...');
    mqttConnection.on('message', (topic, payload) => {
      events.testPayload(payload);
    });

    mqttConnection.on('disconnect', () => {
      throw new Error('MQTT connection was dropped. Aborting tests.');
    });

    fatLog('Waiting for API Server...');
    await waitPort({
      host: 'localhost',
      port: parseInt(process.env.PORT),
    });

    fatLog('Preparing for DB connection...');
    const database = new Sequelize(MYSQL_DATABASE, MYSQL_USERNAME, MYSQL_PASSWORD, {
      dialect: 'mysql',
      host: MYSQL_WRITE_HOST,
      port: MYSQL_PORT,
    });

    fatLog('Testing DB Connection...');
    await database.authenticate();

    fatLog('Truncating DB...');
    await database.transaction(transaction => {
      return database.query('SET FOREIGN_KEY_CHECKS = 0', { transaction }).then(() => {
        return database.query(
          `SELECT Concat('TRUNCATE TABLE ',table_schema,'.',TABLE_NAME, ';')
          FROM INFORMATION_SCHEMA.TABLES
          WHERE table_schema in ('${MYSQL_DATABASE}');`,
          { transaction },
        );
      }).then(results => {
        let truncatePromises = [];

        results[0].forEach(result => {
          Object.keys(result).forEach(key => {
            truncatePromises.push(database.query(result[key], { transaction }));
          });
        });

        return Promise.all(truncatePromises);
      });
    });

    fatLog('Creating global test user one...');
    await chai.request(server).post('/users').send(testUserOne);
    const createdTestUserOneResponse = await chai.request(server).post('/users').send(Object.assign({}, testUserOne, { phoneLoginCode: '000000' }));
    testUserOne = { ...createdTestUserOneResponse.body, ...testUserOne };
    mqttConnection.subscribe(testUserOne.eventsTopic);
    await chai.request(server)
      .patch('/users')
      .set('X-Access-Token', testUserOne.accessToken)
      .send(testUserOne);


    fatLog('Creating global test user two...');
    await chai.request(server).post('/users').send(testUserTwo);
    const createdTestUserTwoResponse = await chai.request(server).post('/users').send(Object.assign({}, testUserTwo, { phoneLoginCode: '000000' }));
    testUserTwo = { ...createdTestUserTwoResponse.body, ...testUserTwo };
    mqttConnection.subscribe(testUserTwo.eventsTopic);
    await chai.request(server)
      .patch('/users')
      .set('X-Access-Token', testUserTwo.accessToken)
      .send(testUserTwo);


    fatLog('Creating global test user three...');
    await chai.request(server).post('/users').send(testUserThree);
    const createdTestUserThreeResponse = await chai.request(server).post('/users').send(Object.assign({}, testUserThree, { phoneLoginCode: '000000' }));
    testUserThree = { ...createdTestUserThreeResponse.body, ...testUserThree };
    mqttConnection.subscribe(testUserThree.eventsTopic);
    await chai.request(server)
      .patch('/users')
      .set('X-Access-Token', testUserThree.accessToken)
      .send(testUserThree);

    fatLog('Creating global test user four...');
    await chai.request(server).post('/users').send(testUserFour);
    const createdTestUserFourResponse = await chai.request(server).post('/users').send(Object.assign({}, testUserFour, { phoneLoginCode: '000000' }));
    testUserFour = { ...createdTestUserFourResponse.body, ...testUserFour };
    mqttConnection.subscribe(testUserFour.eventsTopic);
    await chai.request(server)
      .patch('/users')
      .set('X-Access-Token', testUserFour.accessToken)
      .send(testUserFour);

    fatLog('Setting test user one as a follower of test user three...');
    await chai.request(server)
      .put(`/users/${testUserThree.id}/followers`)
      .set('X-Access-Token', testUserOne.accessToken);

    fatLog('Updating global test user one...');
    await chai.request(server)
      .patch('/users')
      .set('X-Access-Token', testUserOne.accessToken)
      .send({ name: 'braydon' });

    fatLog('Creating global test room one...');
    const createdTestRoomOne = await chai.request(server)
      .post('/rooms')
      .set('X-Access-Token', testUserOne.accessToken)
      .send(testRoomOne);
    Object.assign(testRoomOne, createdTestRoomOne.body);
    mqttConnection.subscribe(testRoomOne.eventsTopic);

    fatLog('Creating global test room two...');
    const createdTestRoomTwo = await chai.request(server)
      .post('/rooms')
      .set('X-Access-Token', testUserTwo.accessToken)
      .send(testRoomTwo);
    Object.assign(testRoomTwo, createdTestRoomTwo.body);
    mqttConnection.subscribe(testRoomTwo.eventsTopic);

    fatLog('Creating global test room three...');
    const createdTestRoomThree = await chai.request(server)
      .post('/rooms')
      .set('X-Access-Token', testUserThree.accessToken)
      .send(testRoomThree);
    Object.assign(testRoomThree, createdTestRoomThree.body);
    mqttConnection.subscribe(testRoomThree.eventsTopic);

    fatLog('Creating global test room one user one...');
    const createdTestRoomOneUserOne = await chai.request(server)
      .put(`/rooms/${testRoomOne.id}/users`)
      .set('X-Access-Token', testUserOne.accessToken)
      .send({ userId: testUserTwo.id });
    Object.assign(testRoomOneUserOne, createdTestRoomOneUserOne.body);

    fatLog('Creating global test room one message one...');
    const createdTestRoomOneMessageOne = await chai.request(server)
      .post(`/rooms/${testRoomOne.id}/messages`)
      .set('X-Access-Token', testUserOne.accessToken)
      .send(testRoomOneMessageOne);
    Object.assign(testRoomOneMessageOne, createdTestRoomOneMessageOne.body);

    fatLog('Creating global test room one message one reaction one...');
    const createdTestRoomOneMessageOneReactionOne = await chai.request(server)
      .put(`/rooms/${testRoomOne.id}/messages/${testRoomOneMessageOne.id}/reactions`)
      .set('X-Access-Token', testUserOne.accessToken)
      .send(testRoomOneMessageOneReactionOne);
    Object.assign(testRoomOneMessageOneReactionOne, createdTestRoomOneMessageOneReactionOne.body);

    fatLog('Creating global test room one repost one...');
    const createdTestRoomOneRepostOne = await chai.request(server)
      .put(`/rooms/${testRoomOne.id}/reposts`)
      .set('X-Access-Token', testUserThree.accessToken);
    Object.assign(testRoomOneRepostOne, createdTestRoomOneRepostOne.body);

    fatLog('Creating global test permissions public room');
    const createdTestPermissionsPublicRoom = await chai.request(server)
      .post('/rooms')
      .set('X-Access-Token', testUserOne.accessToken)
      .send(testPermissionsPublicRoom);
    Object.assign(testPermissionsPublicRoom, createdTestPermissionsPublicRoom.body);

    fatLog('Setting global test permissions public room message one...');
    Object.assign(testPermissionsPublicRoomMessageOne, testPermissionsPublicRoom.roomMessages[0]);

    fatLog('Setting global test permissions public room admin user...');
    Object.assign(testPermissionsPublicRoomAdminUser, testUserOne);
    testPermissionsPublicRoomAdminRoomUser = testPermissionsPublicRoom.previewRoomUsers.find(roomUser => {
      return roomUser.user.id === testUserOne.id;
    });

    fatLog('Setting global test permissions public room general user...');
    Object.assign(testPermissionsPublicRoomGeneralUser, testUserTwo);
    testPermissionsPublicRoomGeneralRoomUser = testPermissionsPublicRoom.previewRoomUsers.find(roomUser => {
      return roomUser.user.id === testUserTwo.id;
    });

    fatLog('Setting global test permissions public room permissionless user...');
    Object.assign(testPermissionsPublicRoomPermissionlessUser, testUserThree);
    testPermissionsPublicRoomPermissionlessRoomUser = testPermissionsPublicRoom.previewRoomUsers.find(roomUser => {
      return roomUser.user.id === testUserThree.id;
    });

    await chai.request(server)
      .patch(`/rooms/${testPermissionsPublicRoom.id}/users/${testPermissionsPublicRoomPermissionlessRoomUser.id}`)
      .set('X-Access-Token', testUserOne.accessToken)
      .send({ permissions: [] });


    fatLog('Creating global test permissions protected room');
    const createdTestPermissionsProtectedRoom = await chai.request(server)
      .post('/rooms')
      .set('X-Access-Token', testUserOne.accessToken)
      .send(testPermissionsProtectedRoom);
    Object.assign(testPermissionsProtectedRoom, createdTestPermissionsProtectedRoom.body);

    fatLog('Setting global test permissions protected room message one...');
    Object.assign(testPermissionsProtectedRoomMessageOne, testPermissionsProtectedRoom.roomMessages[0]);

    fatLog('Setting global test permissions protected room admin user...');
    Object.assign(testPermissionsProtectedRoomAdminUser, testUserOne);
    testPermissionsProtectedRoomAdminRoomUser = testPermissionsProtectedRoom.previewRoomUsers.find(roomUser => {
      return roomUser.user.id === testUserOne.id;
    });

    fatLog('Setting global test permissions protected room general user...');
    Object.assign(testPermissionsProtectedRoomGeneralUser, testUserTwo);
    testPermissionsProtectedRoomGeneralRoomUser = testPermissionsProtectedRoom.previewRoomUsers.find(roomUser => {
      return roomUser.user.id === testUserTwo.id;
    });

    fatLog('Setting global test permissions protected room permissionless user...');
    Object.assign(testPermissionsProtectedRoomPermissionlessUser, testUserThree);
    testPermissionsProtectedRoomPermissionlessRoomUser = testPermissionsProtectedRoom.previewRoomUsers.find(roomUser => {
      return roomUser.user.id === testUserThree.id;
    });

    await chai.request(server)
      .patch(`/rooms/${testPermissionsProtectedRoom.id}/users/${testPermissionsProtectedRoomPermissionlessRoomUser.id}`)
      .set('X-Access-Token', testUserOne.accessToken)
      .send({ permissions: [] });


    fatLog('Creating global test permissions private room');
    const createdTestPermissionsPrivateRoom = await chai.request(server)
      .post('/rooms')
      .set('X-Access-Token', testUserOne.accessToken)
      .send(testPermissionsPrivateRoom);
    Object.assign(testPermissionsPrivateRoom, createdTestPermissionsPrivateRoom.body);

    fatLog('Setting global test permissions private room message one...');
    Object.assign(testPermissionsPrivateRoomMessageOne, testPermissionsPrivateRoom.roomMessages[0]);

    fatLog('Setting global test permissions private room admin user...');
    Object.assign(testPermissionsPrivateRoomAdminUser, testUserOne);
    testPermissionsPrivateRoomAdminRoomUser = testPermissionsPrivateRoom.previewRoomUsers.find(roomUser => {
      return roomUser.user.id === testUserOne.id;
    });

    fatLog('Setting global test permissions private room general user...');
    Object.assign(testPermissionsPrivateRoomGeneralUser, testUserTwo);
    testPermissionsPrivateRoomGeneralRoomUser = testPermissionsPrivateRoom.previewRoomUsers.find(roomUser => {
      return roomUser.user.id === testUserTwo.id;
    });

    fatLog('Setting global test permissions private room permissionless user...');
    Object.assign(testPermissionsPrivateRoomPermissionlessUser, testUserThree);
    testPermissionsPrivateRoomPermissionlessRoomUser = testPermissionsPrivateRoom.previewRoomUsers.find(roomUser => {
      return roomUser.user.id === testUserThree.id;
    });

    await chai.request(server)
      .patch(`/rooms/${testPermissionsPrivateRoom.id}/users/${testPermissionsPrivateRoomPermissionlessRoomUser.id}`)
      .set('X-Access-Token', testUserOne.accessToken)
      .send({ permissions: [] });


    fatLog('Creating global test attachment one...');
    const createdTestAttachmentOne = await chai.request(server)
      .put('/attachments')
      .set('X-Access-Token', testUserOne.accessToken)
      .attach('file', fs.readFileSync('./test/yosemite.jpg'), 'yosemite.jpg');
    Object.assign(testAttachmentOne, createdTestAttachmentOne.body);

    fatLog('Creating global test embed one...');
    const createdTestEmbedOne = await chai.request(server)
      .put('/embeds')
      .set('X-Access-Token', testUserOne.accessToken)
      .send(testEmbedOne);
    Object.assign(testEmbedOne, createdTestEmbedOne.body);

    done();
  })();
});

/*
 * Helpers
 */

function fatLog(message) {
  let divider = Array(message.length + 1).join('=');

  console.log('\n');
  console.log(divider);
  console.log(message);
  console.log(divider);
  console.log('\n');
}
