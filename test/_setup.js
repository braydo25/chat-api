/*
 * Import Environment variables
 */

require('dotenv').config();

/*
 * Dependencies
 */

const fs = require('fs');

/*
 * Set Globals
 */

global.chai = require('chai');
global.chaiHttp = require('chai-http');
global.server = `http://localhost:${process.env.PORT}`;

global.enableTestResponseLogging = true;

global.testUserOne = { phone: 15555555555 };
global.testUserTwo = { phone: 16666666666 };
global.testUserThree = { phone: 18888888888 };
global.testUserFour = { phone: 19999999999 };

global.testConversationOne = {
  accessLevel: 'public',
  message: {
    text: 'Sir, this is a wendys',
  },
};

global.testConversationTwo = {
  accessLevel: 'private',
  message: {
    text: 'testing private',
  },
  users: [ 1 ],
};

global.testConversationThree = {
  accessLevel: 'public',
  message: {
    text: 'testing public',
  },
  users: [ 1 ],
};

global.testConversationOneUserOne = {};

global.testConversationOneMessageOne = {
  text: 'This is a test',
};

global.testConversationOneMessageOneReactionOne = {
  reaction: '🐻',
};

global.testPermissionsPublicConversation = {
  accessLevel: 'public',
  message: {
    text: 'this is a public convo!',
  },
  users: [ 1, 2, 3 ],
};
global.testPermissionsPublicConversationMessageOne = {};
global.testPermissionsPublicConversationAdminUser = {};
global.testPermissionsPublicConversationGeneralUser = {};
global.testPermissionsPublicConversationPermissionlessUser = {};
global.testPermissionsPublicConversationAdminConversationUser = {};
global.testPermissionsPublicConversationGeneralConversationUser = {};
global.testPermissionsPublicConversationPermissionlessConversationUser = {};

global.testPermissionsProtectedConversation = {
  accessLevel: 'protected',
  message: {
    text: 'this is a protected convo!',
  },
  users: [ 1, 2, 3 ],
};
global.testPermissionsProtectedConversationMessageOne = {};
global.testPermissionsProtectedConversationAdminUser = {};
global.testPermissionsProtectedConversationGeneralUser = {};
global.testPermissionsProtectedConversationPermissionlessUser = {};
global.testPermissionsProtectedConversationAdminConversationUser = {};
global.testPermissionsProtectedConversationGeneralConversationUser = {};
global.testPermissionsProtectedConversationPermissionlessConversationUser = {};

global.testPermissionsPrivateConversation = {
  accessLevel: 'private',
  message: {
    text: 'this is a private convo!',
  },
  users: [ 1, 2, 3 ],
};
global.testPermissionsPrivateConversationMessageOne = {};
global.testPermissionsPrivateConversationAdminUser = {};
global.testPermissionsPrivateConversationGeneralUser = {};
global.testPermissionsPrivateConversationPermissionlessUser = {};
global.testPermissionsPrivateConversationAdminConversationUser = {};
global.testPermissionsPrivateConversationGeneralConversationUser = {};
global.testPermissionsPrivateConversationPermissionlessConversationUser = {};

global.testAttachmentOne = {};
global.testEmbedOne = { url: 'https://www.instagram.com/p/B9aahmTHcVL/' };

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
    const database = new Sequelize(MYSQL_DATABASE, MYSQL_USERNAME, MYSQL_PASSWORD, {
      dialect: 'mysql',
      host: MYSQL_WRITE_HOST,
      port: MYSQL_PORT,
    });

    fatLog('Waiting for API Server...');
    await waitPort({
      host: 'localhost',
      port: parseInt(process.env.PORT),
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
    Object.assign(testUserOne, createdTestUserOneResponse.body);

    fatLog('Creating global test user two...');
    await chai.request(server).post('/users').send(testUserTwo);
    const createdTestUserTwoResponse = await chai.request(server).post('/users').send(Object.assign({}, testUserTwo, { phoneLoginCode: '000000' }));
    Object.assign(testUserTwo, createdTestUserTwoResponse.body);

    fatLog('Creating global test user three...');
    await chai.request(server).post('/users').send(testUserThree);
    const createdTestUserThreeResponse = await chai.request(server).post('/users').send(Object.assign({}, testUserThree, { phoneLoginCode: '000000' }));
    Object.assign(testUserThree, createdTestUserThreeResponse.body);

    fatLog('Creating global test user four...');
    await chai.request(server).post('/users').send(testUserFour);
    const createdTestUserFourResponse = await chai.request(server).post('/users').send(Object.assign({}, testUserThree, { phoneLoginCode: '000000' }));
    Object.assign(testUserFour, createdTestUserFourResponse.body);

    fatLog('Creating global test conversation one...');
    const createdTestConversationOne = await chai.request(server)
      .post('/conversations')
      .set('X-Access-Token', testUserOne.accessToken)
      .send(testConversationOne);
    Object.assign(testConversationOne, createdTestConversationOne.body);

    fatLog('Creating global test conversation two...');
    const createdTestConversationTwo = await chai.request(server)
      .post('/conversations')
      .set('X-Access-Token', testUserTwo.accessToken)
      .send(testConversationTwo);
    Object.assign(testConversationTwo, createdTestConversationTwo.body);

    fatLog('Creating global test conversation three...');
    const createdTestConversationThree = await chai.request(server)
      .post('/conversations')
      .set('X-Access-Token', testUserTwo.accessToken)
      .send(testConversationThree);
    Object.assign(testConversationThree, createdTestConversationThree.body);

    fatLog('Creating global test conversation one user one...');
    const createdTestConversationOneUserOne = await chai.request(server)
      .put(`/conversations/${testConversationOne.id}/users`)
      .set('X-Access-Token', testUserOne.accessToken)
      .send({ userId: testUserTwo.id });
    Object.assign(testConversationOneUserOne, createdTestConversationOneUserOne.body);

    fatLog('Creating global test conversation one message one...');
    const createdTestConversationOneMessageOne = await chai.request(server)
      .post(`/conversations/${testConversationOne.id}/messages`)
      .set('X-Access-Token', testUserOne.accessToken)
      .send(testConversationOneMessageOne);
    Object.assign(testConversationOneMessageOne, createdTestConversationOneMessageOne.body);

    fatLog('Creating global test conversation one message one reaction one...');
    const createdTestConversationOneMessageOneReactionOne = await chai.request(server)
      .put(`/conversations/${testConversationOne.id}/messages/${testConversationOneMessageOne.id}/reactions`)
      .set('X-Access-Token', testUserOne.accessToken)
      .send(testConversationOneMessageOneReactionOne);
    Object.assign(testConversationOneMessageOneReactionOne, createdTestConversationOneMessageOneReactionOne.body);


    fatLog('Creating global test permissions public conversation');
    const createdTestPermissionsPublicConversation = await chai.request(server)
      .post('/conversations')
      .set('X-Access-Token', testUserOne.accessToken)
      .send(testPermissionsPublicConversation);
    Object.assign(testPermissionsPublicConversation, createdTestPermissionsPublicConversation.body);

    fatLog('Setting global test permissions public conversation message one...');
    Object.assign(testPermissionsPublicConversationMessageOne, testPermissionsPublicConversation.conversationMessages[0]);

    fatLog('Setting global test permissions public conversation admin user...');
    Object.assign(testPermissionsPublicConversationAdminUser, testUserOne);
    testPermissionsPublicConversationAdminConversationUser = testPermissionsPublicConversation.conversationUsers.find(conversationUser => {
      return conversationUser.user.id === testUserOne.id;
    });

    fatLog('Setting global test permissions public conversation general user...');
    Object.assign(testPermissionsPublicConversationGeneralUser, testUserTwo);
    testPermissionsPublicConversationGeneralConversationUser = testPermissionsPublicConversation.conversationUsers.find(conversationUser => {
      return conversationUser.user.id === testUserTwo.id;
    });

    fatLog('Setting global test permissions public conversation permissionless user...');
    Object.assign(testPermissionsPublicConversationPermissionlessUser, testUserThree);
    testPermissionsPublicConversationPermissionlessConversationUser = testPermissionsPublicConversation.conversationUsers.find(conversationUser => {
      return conversationUser.user.id === testUserThree.id;
    });

    await chai.request(server)
      .patch(`/conversations/${testPermissionsPublicConversation.id}/users/${testPermissionsPublicConversationPermissionlessConversationUser.id}`)
      .set('X-Access-Token', testUserOne.accessToken)
      .send({ permissions: [] });


    fatLog('Creating global test permissions protected conversation');
    const createdTestPermissionsProtectedConversation = await chai.request(server)
      .post('/conversations')
      .set('X-Access-Token', testUserOne.accessToken)
      .send(testPermissionsProtectedConversation);
    Object.assign(testPermissionsProtectedConversation, createdTestPermissionsProtectedConversation.body);

    fatLog('Setting global test permissions protected conversation message one...');
    Object.assign(testPermissionsProtectedConversationMessageOne, testPermissionsProtectedConversation.conversationMessages[0]);

    fatLog('Setting global test permissions protected conversation admin user...');
    Object.assign(testPermissionsProtectedConversationAdminUser, testUserOne);
    testPermissionsProtectedConversationAdminConversationUser = testPermissionsProtectedConversation.conversationUsers.find(conversationUser => {
      return conversationUser.user.id === testUserOne.id;
    });

    fatLog('Setting global test permissions protected conversation general user...');
    Object.assign(testPermissionsProtectedConversationGeneralUser, testUserTwo);
    testPermissionsProtectedConversationGeneralConversationUser = testPermissionsProtectedConversation.conversationUsers.find(conversationUser => {
      return conversationUser.user.id === testUserTwo.id;
    });

    fatLog('Setting global test permissions protected conversation permissionless user...');
    Object.assign(testPermissionsProtectedConversationPermissionlessUser, testUserThree);
    testPermissionsProtectedConversationPermissionlessConversationUser = testPermissionsProtectedConversation.conversationUsers.find(conversationUser => {
      return conversationUser.user.id === testUserThree.id;
    });

    await chai.request(server)
      .patch(`/conversations/${testPermissionsProtectedConversation.id}/users/${testPermissionsProtectedConversationPermissionlessConversationUser.id}`)
      .set('X-Access-Token', testUserOne.accessToken)
      .send({ permissions: [] });


    fatLog('Creating global test permissions private conversation');
    const createdTestPermissionsPrivateConversation = await chai.request(server)
      .post('/conversations')
      .set('X-Access-Token', testUserOne.accessToken)
      .send(testPermissionsPrivateConversation);
    Object.assign(testPermissionsPrivateConversation, createdTestPermissionsPrivateConversation.body);

    fatLog('Setting global test permissions private conversation message one...');
    Object.assign(testPermissionsPrivateConversationMessageOne, testPermissionsPrivateConversation.conversationMessages[0]);

    fatLog('Setting global test permissions private conversation admin user...');
    Object.assign(testPermissionsPrivateConversationAdminUser, testUserOne);
    testPermissionsPrivateConversationAdminConversationUser = testPermissionsPrivateConversation.conversationUsers.find(conversationUser => {
      return conversationUser.user.id === testUserOne.id;
    });

    fatLog('Setting global test permissions private conversation general user...');
    Object.assign(testPermissionsPrivateConversationGeneralUser, testUserTwo);
    testPermissionsPrivateConversationGeneralConversationUser = testPermissionsPrivateConversation.conversationUsers.find(conversationUser => {
      return conversationUser.user.id === testUserTwo.id;
    });

    fatLog('Setting global test permissions private conversation permissionless user...');
    Object.assign(testPermissionsPrivateConversationPermissionlessUser, testUserThree);
    testPermissionsPrivateConversationPermissionlessConversationUser = testPermissionsPrivateConversation.conversationUsers.find(conversationUser => {
      return conversationUser.user.id === testUserThree.id;
    });

    await chai.request(server)
      .patch(`/conversations/${testPermissionsPrivateConversation.id}/users/${testPermissionsPrivateConversationPermissionlessConversationUser.id}`)
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
