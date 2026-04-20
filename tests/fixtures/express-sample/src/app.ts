import express from 'express';

const app = express();

function requireAuth(req, res, next) {
  return next();
}

const listUsers = async (_req, res) => res.json([]);
const getUser = async (_req, res) => res.json({ id: '1' });
const createUser = async (_req, res) => res.status(201).json({ ok: true });

app.get('/users', requireAuth, listUsers);
app.get('/api/v1/users/:id', requireAuth, getUser);
app.post('/users', requireAuth, createUser);

export default app;
