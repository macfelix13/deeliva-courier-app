// Classic (Lambda-compatible) Netlify Function format — deliberate, so we
// can wrap the existing Express app with `serverless-http` instead of
// rewriting every route as a Fetch-style handler.
const serverless = require('serverless-http');
const { app } = require('../../src/app');

const handler = serverless(app);

exports.handler = async (event, context) => {
  // The redirect in netlify.toml sends /api/* to
  // /.netlify/functions/api/:splat, so `event.path` arrives as
  // /.netlify/functions/api/v1/... — put it back to /api/v1/... to match
  // the Express app's routes (which are also used by src/server.ts locally).
  const path = event.path.replace(/^\/\.netlify\/functions\/api/, '/api');
  return handler({ ...event, path }, context);
};
