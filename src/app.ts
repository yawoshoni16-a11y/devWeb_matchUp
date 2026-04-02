import express, { type Express } from 'express'
import { userController } from './controllers/user.controller';

export const app : Express = express();

app.use(express.json());

// --- CORS for swagger and development ---
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin ?? '*');
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// use the controller to use the route | defines the route to users
app.use('/users', userController);

// use the controller to use the route | defines the route to fields
app.use('/fields', userController);

// use the controller to use the route | defines the route to games
app.use('/games', userController);

// use the controller to use the route | defines the route to teams
app.use('/teams', userController);