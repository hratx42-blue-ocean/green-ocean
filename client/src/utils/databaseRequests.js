import axios from 'axios';

function postUserData(userObject) {
  return axios
    .post('http://0.0.0.0:8000/api/users/upsertData', {
      userUpdate: userObject
    })
    .then(okResponse => console.log(okResponse));
}

function getUserData(userID) {
  return axios.get(`http://0.0.0.0:8000/api/users/getData?userid=${userID}`);
}

export default {
  postUserData,
  getUserData
};