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
