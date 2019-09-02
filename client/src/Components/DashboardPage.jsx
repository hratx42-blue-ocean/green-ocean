import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider
} from '@material-ui/pickers';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import Loading from './Loading';
// import { Auth0Context } from '../react-auth0-wrapper';

import db from '../utils/databaseRequests';
import format from '../utils/formatCurrency';

const useStyles = makeStyles({
  root: {
    flexGrow: 1
  }
});
const DashboardPage = ({
  user,
  accounts,
  categories,
  transactions,
  loading,
  isAuthenticated
}) => {
  // state
  const [txAccount, setTxAccount] = useState('');
  const [txAccountId, setTxAccountId] = useState(undefined);
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txCategoryId, setTxCategoryId] = useState(undefined);
  const [txDate, setTxDate] = useState(moment().format('YYYY-MM-DD'));
  const [txMemo, setTxMemo] = useState('');
  const [txType, setTxType] = useState('');

  // styling
  const classes = useStyles();

  const handleAccountInput = event => {
    setTxAccount(event.target.value);
    setTxAccountId(event.nativeEvent.target.getAttribute('recordid'));
  };

  const handleAmountInput = event => {
    setTxAmount(Number(event.target.value));
  };

  const handleCategoryInput = event => {
    setTxCategory(event.target.value);
    setTxCategoryId(event.nativeEvent.target.getAttribute('recordid'));
  };

  const handleDateInput = event => {
    setTxDate(event.format('YYYY-MM-DD'));
  };

  const handleMemoInput = event => {
    setTxMemo(event.target.value);
  };

  const handleTransactionType = event => {
    if (event.target.value === 'outflow') {
      // debit
      setTxType(1);
    } else {
      // credit
      setTxType(2);
    }
  };

  const calculateTotalBalance = () => {
    return accounts.reduce((sum, account) => {
      // only adds balances for accounts of type checking or savings
      if (account.type !== 3) {
        return sum + account.balance;
      }
      return sum;
    }, 0);
  };

  const clearTransactionInput = () => {
    setState({
      txAccount: '',
      txAccountId: undefined,
      txAmount: '',
      txCategory: '',
      txCategoryId: undefined,
      txDate: moment(),
      txMemo: '',
      txType: ''
    });
  };

  const handleSubmitTransaction = () => {
    const txRecurring = 0;
    const txUser = user.id;

    db.postTransaction(
      txAccountId,
      txAmount,
      txCategoryId,
      txDate,
      txMemo,
      txRecurring,
      txType,
      txUser
    )
      .then(() => clearTransactionInput())
      .catch(console.error);
  };

  if (loading || !isAuthenticated) {
    return (
      <div data-testid="auth-loading">
        <Loading />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="flex-start"
        style={{ padding: 20 }}
      >
        <Grid
          container
          direction="column"
          justify="space-between"
          alignItems="flex-start"
          style={{ width: '40%', margin: 20 }}
        >
          <Paper
            style={{
              width: '100%',
              height: 150,
              marginBottom: 20,
              padding: 25
            }}
          >
            <Typography
              style={{ textAlign: 'center' }}
              variant="h3"
              gutterBottom
            >
              Hello, {user.first_name}!
              <Tooltip
                placement="top"
                title="Safe to spend balance: bank accounts less credit card debt"
              >
                <Typography style={{ textAlign: 'center' }} variant="h5">
                  You have {format(calculateTotalBalance())} total
                </Typography>
              </Tooltip>
            </Typography>
          </Paper>
        </Grid>

        <Paper style={{ width: '40%', margin: 20, padding: 25 }}>
          <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
          >
            <Typography variant="h4">Add a transaction</Typography>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <KeyboardDatePicker
                variant="inline"
                format="MM/DD/YYYY"
                margin="normal"
                value={txDate}
                onChange={handleDateInput}
              />
            </MuiPickersUtilsProvider>

            <TextField
              id="amount"
              label="amount"
              type="number"
              value={txAmount}
              onChange={handleAmountInput}
              margin="normal"
            />
            <FormLabel component="legend">
              Is this an outflow or inflow?{' '}
            </FormLabel>
            <RadioGroup
              aria-label="position"
              name="position"
              onChange={handleTransactionType}
              row
            >
              <FormControlLabel
                value="outflow"
                control={<Radio color="primary" />}
                label="outflow"
                labelPlacement="start"
              />
              <FormControlLabel
                value="inflow"
                control={<Radio color="primary" />}
                label="inflow"
                labelPlacement="start"
              />
            </RadioGroup>
            <Select value={txCategory} onChange={handleCategoryInput}>
              {categories.map(category => {
                const { id, name } = category;
                return (
                  <MenuItem key={id} recordid={id} value={name}>
                    {name}
                  </MenuItem>
                );
              })}
            </Select>
            <Select value={txAccount} onChange={handleAccountInput}>
              {accounts.map(account => {
                const { id, name } = account;
                return (
                  <MenuItem key={id} recordid={id} value={name}>
                    {name}
                  </MenuItem>
                );
              })}
            </Select>
            <TextField
              id="payee"
              label="payee"
              value={txMemo}
              onChange={handleMemoInput}
              margin="normal"
            />
            <Button onClick={handleSubmitTransaction} color="primary">
              Add transaction
            </Button>
          </Grid>
        </Paper>
      </Grid>
    </div>
  );
};

DashboardPage.defaultProps = {
  accountData: {
    email: 'asdf@asdf.com',
    firstName: 'lsdkfj',
    lastName: 'lkdasjf'
  }
};

DashboardPage.propTypes = {
  accountData: PropTypes.object.isRequired,
  handleAddTransaction: PropTypes.func,
  loading: PropTypes.bool.isRequired,
  updateAccountData: PropTypes.func,
  isAuthenticated: PropTypes.bool.isRequired
};

export default DashboardPage;
