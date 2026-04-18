import express from 'express';

const app = express();

function requireAuth(req, res, next) {
  return next();
}

const listUsers = async (_req, res) => res.json([]);
const createUser = async (_req, res) => res.status(201).json({ ok: true });

app.get('/users', requireAuth, listUsers);
app.post('/users', requireAuth, createUser);

export default app;
