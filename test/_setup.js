/*
 * Import Environment variables
 */

require('dotenv').config();

/*
 * Set Globals
 */

global.chai = require('chai');
global.chaiHttp = require('chai-http');
global.server = `http://localhost:${process.env.PORT}`;

global.testUserOne = { username: 'monkey', password: 'banana' };
global.testUserTwo = { username: 'chimp', password: 'apple' };
global.testUserThree = { username: 'gorilla', password: 'berry' };
global.testRoomOne = { name: 'Magic The Gathering' };
global.testRoomOneChannelOne = { name: 'Modern Strategy' };

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
    const createdTestUserOneResponse = await chai.request(server)
      .post('/users')
      .send(testUserOne);
    Object.assign(testUserOne, createdTestUserOneResponse.body);

    fatLog('Creating global test user two...');
    const createdTestUserTwoResponse = await chai.request(server)
      .post('/users')
      .send(testUserTwo);
    Object.assign(testUserTwo, createdTestUserTwoResponse.body);

    fatLog('Creating global test user three...');
    const createdTestUserThreeResponse = await chai.request(server)
      .post('/users')
      .send(testUserThree);
    Object.assign(testUserThree, createdTestUserThreeResponse.body);

    fatLog('Creating global test room one...');
    const createdTestRoomOneResponse = await chai.request(server)
      .post('/rooms')
      .set('X-Access-Token', testUserOne.accessToken)
      .send(testRoomOne);
    Object.assign(testRoomOne, createdTestRoomOneResponse.body);

    fatLog('Creating global test room one channel one...');
    const createdTestRoomOneChannelOneResponse = await chai.request(server)
      .post(`/rooms/${testRoomOne.id}/channels`)
      .set('X-Access-Token', testUserOne.accessToken)
      .send(testRoomOneChannelOne);
    Object.assign(testRoomOneChannelOne, createdTestRoomOneChannelOneResponse.body);

    fatLog('Adding test user three to test room one...');
    await chai.request(server)
      .post(`/users/@me/rooms/${testRoomOne.id}`)
      .set('X-Access-Token', testUserThree.accessToken);

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
