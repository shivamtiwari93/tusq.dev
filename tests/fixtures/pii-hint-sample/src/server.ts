import Fastify from 'fastify';

const fastify = Fastify();

// M25: canonical PII field names — email and password match directly
fastify.route({
  method: 'POST',
  url: '/auth',
  schema: {
    body: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' }
      },
      required: ['email', 'password']
    }
  },
  handler: async function login() { return { ok: true }; }
});

// M25: normalized names — user_email→useremail, first_name→firstname, phone_number→phonenumber
// account_type→accounttype does NOT match any canonical PII name
fastify.route({
  method: 'POST',
  url: '/register',
  schema: {
    body: {
      type: 'object',
      properties: {
        user_email: { type: 'string' },
        first_name: { type: 'string' },
        phone_number: { type: 'string' },
        account_type: { type: 'string' }
      },
      required: ['user_email']
    }
  },
  handler: async function register() { return { ok: true }; }
});

// M26: mixed categories — email, government_id, and payment in declaration order
fastify.route({
  method: 'POST',
  url: '/profile',
  schema: {
    body: {
      type: 'object',
      properties: {
        user_email: { type: 'string' },
        ssn: { type: 'string' },
        credit_card: { type: 'string' },
        email_template_id: { type: 'string' }
      },
      required: ['user_email']
    }
  },
  handler: async function profile() { return { ok: true }; }
});

// M25: no PII-named body fields — pii_fields must be []
fastify.get('/catalog', async function listCatalog() { return []; });
