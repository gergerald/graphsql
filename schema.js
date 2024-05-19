const { gql } = require('apollo-server-express');
const { v4: uuidv4 } = require('uuid');

// Static data for testing
const users = [
  { id: uuidv4(), name: 'Alice Johnson', email: 'alice@example.com', accounts: [] },
  { id: uuidv4(), name: 'Bob Smith', email: 'bob@example.com', accounts: [] },
];

const accounts = [
  { id: uuidv4(), accountNumber: '1234567890', balance: 1000.0, userId: users[0].id, transactions: [] },
  { id: uuidv4(), accountNumber: '0987654321', balance: 2000.0, userId: users[1].id, transactions: [] },
];

const transactions = [
  { id: uuidv4(), date: '2024-01-01', amount: 500.0, description: 'Deposit', accountId: accounts[0].id },
  { id: uuidv4(), date: '2024-02-01', amount: 200.0, description: 'Withdrawal', accountId: accounts[1].id },
];

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    accounts: [Account]
  }

  type Account {
    id: ID!
    accountNumber: String!
    balance: Float!
    transactions: [Transaction]
  }

  type Transaction {
    id: ID!
    date: String!
    amount: Float!
    description: String!
  }

  type Query {
    users: [User]
    user(id: ID!): User
    accounts: [Account]
    account(id: ID!): Account
    transactions: [Transaction]
    transaction(id: ID!): Transaction
  }

  type Mutation {
    createUser(name: String!, email: String!): User
    createAccount(accountNumber: String!, balance: Float!, userId: ID!): Account
    createTransaction(accountId: ID!, amount: Float!, description: String!): Transaction
  }
`;

const resolvers = {
  Query: {
    users: () => users,
    user: (parent, { id }) => users.find(user => user.id === id),
    accounts: () => accounts,
    account: (parent, { id }) => accounts.find(account => account.id === id),
    transactions: () => transactions,
    transaction: (parent, { id }) => transactions.find(transaction => transaction.id === id),
  },
  Mutation: {
    createUser: (parent, { name, email }) => {
      const user = { id: uuidv4(), name, email, accounts: [] };
      users.push(user);
      return user;
    },
    createAccount: (parent, { accountNumber, balance, userId }) => {
      const account = { id: uuidv4(), accountNumber, balance, userId, transactions: [] };
      accounts.push(account);
      return account;
    },
    createTransaction: (parent, { accountId, amount, description }) => {
      const transaction = { id: uuidv4(), date: new Date().toISOString(), amount, description, accountId };
      const account = accounts.find(account => account.id === accountId);
      if (!account) throw new Error('Account not found');
      account.transactions.push(transaction);
      transactions.push(transaction);
      return transaction;
    },
  },
  User: {
    accounts: (parent) => accounts.filter(account => account.userId === parent.id),
  },
  Account: {
    transactions: (parent) => transactions.filter(transaction => transaction.accountId === parent.id),
  },
};

module.exports = { typeDefs, resolvers };
