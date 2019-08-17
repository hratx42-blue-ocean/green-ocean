import React, { Component } from 'react';
import axios from 'axios';

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
import Footer from './Components/Footer.jsx';
import ErrorPage from './Components/ErrorPage.jsx';
import Loading from './Components/Loading.jsx';
import db from './utils/databaseRequests';

import createFakeUser from './fakeUserGenerator.js';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: null,
      loadingUser: true,
      currentUser: '',
      budgetCategories: [],
      accountData: {
        accounts: [{ transactions: { year: { month: [] } } }]
      }
    };
    this.setAccountData = this.setAccountData.bind(this);
    this.handleAddTransaction = this.handleAddTransaction.bind(this);
    this.asyncHandleUpdateCategories = this.asyncHandleUpdateCategories.bind(
      this
    );
    this.promiseSetState = this.promiseSetState.bind(this);
  }

  componentDidMount() {
    const { isAuthenticated } = this.context;

    // if the user is unauthenticated, stop loading
    if (!isAuthenticated) {
      this.setState({
        loadingUser: false
      });
    }
  }

  componentDidUpdate() {
    const { user } = this.context;

    // See if a user has authenticated
    if (user && user.sub.substring(6) !== this.state.userID) {
      console.log(`Looks like you're logged in as: ${user.email}`);

      // set the userID to the UUID provided
      const userID = user.sub.substring(6);
      console.log(`Your UserID is ${userID}`);
      this.setState(
        {
          userID,
          loadingUser: true
        },
        // check to see if the user exists in the database
        async () => {
          const response = await db.getUserData(userID);

          const { data: userData } = response;

          // if they exist, set their data in state
          if (userData.length > 0) {
            this.setAccountData(userData[0]);
            console.log(`Welcome back ${userData[0].firstName}!`);
          } else {
            // give the demo data if they don't exit
            console.log(`Welcome to CashOverflow!`);
            // TODO: Fake user data should be replaced with SignUp flow logic.
            const newUserData = createFakeUser();

            console.log(
              `We'll give you some sample data based on the average American's to get you started.`
            );
            newUserData.email = user.email;
            newUserData.userID = userID;

            this.setAccountData(newUserData);
          }
        }
      );
    }
  }

  setAccountData(newAccountData) {
    const { budgetCategories, email } = newAccountData;
    this.setState(
      {
        accountData: newAccountData,
        budgetCategories,
        currentUser: email
      },
      () => {
        this.setState({ loadingUser: false }, () => {
          db.postUserData(this.state.accountData);
        });
      }
    );
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
      this.setAccountData(accountUpdate);
    }

    this.setState({
      currentUser: accountUpdate
    });

    // fn below will update app state, and then POST updated userObject to DB

    this.setAccountData(accountUpdate);
  }

  promiseSetState(userObject) {
    return new Promise((resolve, reject) => {
      this.setState(
        {
          accountData: userObject,
          budgetCategories: userObject.budgetCategories
        },
        () => {
          resolve(this.state.accountData);
        }
      );
    });
  }

  /**
   * WARNING WARNING WARNING
   * This is a major antipattern, we are aware.
   * Somewhere in the complex finanical calcuations, the alloment relays on state and not props, so it's not update as props change.
   * We're not sure where that happens and we plan to refactor finanical calucations to the backend shortly,
   * making this abomination moot.
   */

  asyncHandleUpdateCategories(updatedCategories, callback) {
    const accountUpdate = { ...this.state.accountData };
    accountUpdate.budgetCategories = updatedCategories;
    console.log('modified cats sent in', updatedCategories, accountUpdate);
    this.promiseSetState(accountUpdate)
      .then(updatedAccount => {
        console.log('app level cats: ', updatedAccount);
        callback(updatedAccount.budgetCategories, accountUpdate.accounts);
        return updatedAccount;
      })
      .then(updatedAccount => {
        this.setAccountData(updatedAccount);
      })
      .catch(err => {
        console.log(err);
      });
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
                  updateAccountData={this.setAccountData}
                />
              )}
            />
            <PrivateRoute
              path="/budget"
              render={props => (
                <BudgetPage
                  {...props}
                  accounts={accountData.accounts}
                  categories={budgetCategories}
                  loading={loading}
                  isAuthenticated={isAuthenticated}
                  updateAccountData={this.setAccountData}
                  asyncHandleUpdateCategories={this.asyncHandleUpdateCategories}
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
                  updateAccountData={this.setAccountData}
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
        <Footer />
      </div>
    );
  }
}
App.contextType = Auth0Context;
