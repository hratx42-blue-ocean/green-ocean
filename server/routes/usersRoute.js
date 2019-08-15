const router = require('express').Router();
const db = require('../../db/queries.js');

// middleware below should sanitize to prevent basic table-drop attempts and shenanigans

router.use('/getData', (req, res, next) => {
  req.query.user = req.query.user.replace(/[\\/: +]/g, '');
  console.log(req.query.user);
  next();
});

router.get('/getData', (req, res) => {
  const userEmail = req.query.user;
  db.getUserData(userEmail).then(userData => {
    console.log('User email is: ', userEmail);
    res.send(userData);
  });
});

router.post('/upsertData', (req, res) => {
  if (req.body.userUpdate.userID === 'e06d2c2c-b712-4e98-868e-9d6ba683a595') {
    res.status(200).send('demo mode');
  }
  db.upsertUserData(req.body.userUpdate).then(() => {
    res.send('user updated!');
  });
});

// below route will seed DB with 10 fake users

// router.post('/seedData', (req, res) => {
//   db.seedFakeUserData(10).then(() => {
//     res.send('users seeded!');
//   });
// });

module.exports = router;
