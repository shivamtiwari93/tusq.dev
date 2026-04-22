import Fastify from 'fastify';

const fastify = Fastify();

fastify.get('/orders', {
  schema: {
    response: {
      200: {
        type: 'array'
      }
    }
  }
}, async function listOrders() {
  return [];
});

fastify.route({
  method: 'POST',
  url: '/orders',
  preHandler: requireAuth,
  schema: {
    body: {
      type: 'object'
    }
  },
  handler: createOrder
});

// M24: route with a literal schema.body block — exercising schema body field extraction
fastify.route({
  method: 'POST',
  url: '/items',
  schema: {
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        price: { type: 'number' },
        active: { type: 'boolean' }
      },
      required: ['name', 'price']
    }
  },
  handler: createItem
});

// M24: route with path param :id and body schema declaring 'id' — path param wins on collision
fastify.route({
  method: 'PUT',
  url: '/items/:id',
  schema: {
    body: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' }
      },
      required: ['name']
    }
  },
  handler: updateItem
});

// M24: route with a non-literal schema reference — extractor must fall back to M15 behavior
const sharedSchema = { response: { 200: { type: 'array' } } };
fastify.get('/catalog', { schema: sharedSchema }, async function listCatalog() {
  return [];
});
