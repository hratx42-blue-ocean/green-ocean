import axios from 'axios';

const postUserData = userObject => {
  return axios
    .post('https://cashoverflow.app/api/users/upsertData', {
      userUpdate: userObject
    })
    .then(okResponse => console.log(okResponse));
};

const getUserData = userId => {
  return axios.get(`http://localhost:3000/api/users?id=${userId}`);
};

const getUserAccountData = userId => {
  return axios.get(`http://localhost:3000/api/accounts?id=${userId}`);
};

const getUserAccountTypes = () => {
  return axios.get(`http://localhost:3000/api/accounts/types`);
};

const getUserCategoryData = userId => {
  return axios.get(`http://localhost:3000/api/categories?id=${userId}`);
};

const getUserTransactionData = (userid, year, month) => {
  return axios.get('http://localhost:3000/api/transactions', {
    params: {
      userid,
      year,
      month
    }
  });
};

const postAccount = (name, balance, type, user) => {
  return axios.post('http://localhost:3000/api/accounts', {
    account: { name, balance, type, user }
  });
};

const postTransaction = (
  account,
  amount,
  category,
  date,
  memo,
  recurring,
  type,
  user
) => {
  return axios.post('http://localhost:3000/api/transactions', {
    transaction: {
      account,
      amount,
      category,
      date,
      memo,
      recurring,
      type,
      user
    }
  });
};

export default {
  postUserData,
  getUserData,
  getUserAccountData,
  getUserAccountTypes,
  getUserCategoryData,
  getUserTransactionData,
  postAccount,
  postTransaction
};
