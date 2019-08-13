const assert = require('assert');
const dataSeeder = require('./dataSeeder.js');
const { getUserDatabase } = require('./mongoDB.js');

const getUserData = async userEmail => {
  try {
    const collection = await getUserDatabase().collection('userData');
    const result = await collection
      .find({ email: userEmail })
      .limit(1)
      .toArray();
    assert.equal(1, result.length);
    return result;
  } catch (err) {
    console.log(err);
  }
};

// below is used for seeding DB with n fake users

const seedFakeUserData = async n => {
  try {
    const collection = await getUserDatabase().collection('userData');
    const bulk = collection.initializeUnorderedBulkOp();
    for (let i = 0; i < n; i++) {
      const fakeUserData = dataSeeder.createData();
      bulk.insert(fakeUserData);
    }
    await bulk.execute();
  } catch (err) {
    console.log(err);
  }
};

// below tests schema enforcement with modified insert data

const testSchema = async () => {
  const fakeFella = dataSeeder.createData();

  // uncomment the line below to make the data format incorrect (should fail DB schema validation)

  // fakeFella.middleName = 'ron';

  try {
    const collection = await getUserDatabase().collection('userData');
    await collection.insertOne(fakeFella);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { getUserData, seedFakeUserData, testSchema };
