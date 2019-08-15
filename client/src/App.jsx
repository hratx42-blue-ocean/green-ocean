import React, { Component } from 'react';
import Axios from 'axios';

// Routing
import { Switch, Route, Redirect } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import PrivateRoute from './Components/PrivateRoute.jsx';
import { Auth0Context } from './react-auth0-wrapper';
// Material Components

// Custom Components
import Header from './Components/Header.jsx';
import AccountsPage from './Components/AccountsPage.jsx';
import BudgetPage from './Components/BudgetPage.jsx';
import DashboardPage from './Components/DashboardPage.jsx';
import LandingPage from './Components/LandingPage.jsx';
import TrendsPage from './Components/TrendsPage.jsx';
import LoginPage from './Components/LoginPage.jsx';
import ProfilePage from './Components/ProfilePage.jsx';
import ErrorPage from './Components/ErrorPage.jsx';
import Loading from './Components/Loading.jsx';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingUser: true,
      currentUser: '',
      budgetCategories: [],
      accountData: {
        accounts: [{ transactions: { year: { month: [] } } }]
      }
    };
    this.getUserData = this.getUserData.bind(this);
    this.postUserData = this.postUserData.bind(this);
    this.updateAccountData = this.updateAccountData.bind(this);
    this.setAccountData = this.setAccountData.bind(this);
    this.handleAddTransaction = this.handleAddTransaction.bind(this);
    this.handleUpdateCategories = this.handleUpdateCategories.bind(this);
  }

  componentDidMount() {
    this.getUserData('chadchadson@gmail.com')
      .then(this.setAccountData)
      .then(() => {
        console.log('the user object is: ', this.state.accountData);
      })
      .catch(err => {
        console.log('mounting error: ', err);
      });
  }

  getUserData(userEmail) {
    return Axios.get(`http://0.0.0.0:8000/api/users/getData?user=${userEmail}`);
  }

  postUserData(userObject) {
    Axios.post('http://0.0.0.0:8000/api/users/upsertData', {
      userUpdate: userObject
    }).then(okResponse => console.log(okResponse));
  }

  setAccountData(incomingAccountData) {
    const [currentAccountData] = incomingAccountData.data;
    const { budgetCategories, email } = currentAccountData;
    this.setState({
      accountData: currentAccountData,
      budgetCategories,
      currentUser: email,
      loadingUser: false
    });
  }

  updateAccountData(updatedAccountData) {
    this.postUserData(updatedAccountData);
  }

  handleAddTransaction(stateObject) {
    // this function will live at the dashboard level eventually

    const {
      inputAccount,
      inputAmount,
      inputCategory,
      inputDate,
      inputPayee
    } = stateObject;
    const month = inputDate._d.getMonth();
    const year = inputDate._d.getFullYear();
    const accountUpdate = { ...this.state.accountData };
    const { accounts } = accountUpdate;

    const transaction = {
      id: (420420420420420 + Math.floor(Math.random() * 69696969)).toString(),
      amount: inputAmount,
      category: inputCategory,
      date: inputDate._d,
      payee: inputPayee,
      recurring: false
    };

    for (let i = 0; i < accounts.length; i++) {
      if (accounts[i].name === inputAccount) {
        accountUpdate.accounts[i].transactions[year][month].push(transaction);
        break;
      }
      this.updateAccountData(accountUpdate);
    }

    this.setState({
      currentUser: accountUpdate
    });

    // fn below will update app state, and then POST updated userObject to DB

    this.updateAccountData(accountUpdate);
  }

  handleUpdateCategories(updatedCategories) {
    const accountUpdate = { ...this.state.accountData };
    accountUpdate.budgetCategories = updatedCategories;
    this.setState({
      budgetCategories: updatedCategories,
      accountData: accountUpdate
    });
    this.updateAccountData(accountUpdate);
  }

  render() {
    const { accountData, budgetCategories, loadingUser } = this.state;
    const { isAuthenticated, loading } = this.context;

    if (loadingUser) {
      return (
        <div data-testid="loading-user">
          <Loading />
        </div>
      );
    }

    return (
      <div className="app">
        <Header />
        <Container>
          <Switch>
            <Route
              exact
              path="/"
              render={() =>
                !isAuthenticated ? (
                  <LandingPage />
                ) : (
                  <Redirect to="/dashboard" />
                )
              }
            />
            <PrivateRoute
              path="/accounts"
              render={props => (
                <AccountsPage
                  {...props}
                  accountData={accountData}
                  loading={loading}
                  isAuthenticated={isAuthenticated}
                  updateAccountData={this.updateAccountData}
                />
              )}
            />
            <PrivateRoute
              path="/budget"
              render={props => (
                <BudgetPage
                  accounts={accountData.accounts}
                  categories={budgetCategories}
                  loading={loading}
                  isAuthenticated={isAuthenticated}
                  updateAccountData={this.updateAccountData}
                  handleUpdateCategories={this.handleUpdateCategories}
                />
              )}
            />
            <PrivateRoute
              path="/dashboard"
              render={props => (
                <DashboardPage
                  {...props}
                  handleAddTransaction={this.handleAddTransaction}
                  accountData={accountData}
                  currentUser={this.state.currentUser}
                  loading={loading}
                  isAuthenticated={isAuthenticated}
                />
              )}
            />
            <PrivateRoute
              path="/profile"
              render={props => (
                <ProfilePage
                  {...props}
                  accountData={accountData}
                  loading={loading}
                  isAuthenticated={isAuthenticated}
                  updateAccountData={this.updateAccountData}
                />
              )}
            />
            <PrivateRoute
              path="/trends"
              render={props => (
                <TrendsPage
                  {...props}
                  accountData={accountData}
                  loading={loading}
                  isAuthenticated={isAuthenticated}
                />
              )}
            />
            <Route component={ErrorPage} />
          </Switch>
        </Container>
      </div>
    );
  }
}
App.contextType = Auth0Context;
