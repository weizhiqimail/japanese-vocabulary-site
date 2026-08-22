const path = require('node:path');
const moduleAlias = require('module-alias');
require('mysql2');

process.env.VERCEL_FUNCTION = 'true';
moduleAlias.addAlias('@', path.join(process.cwd(), 'dist'));

let serverPromise;

async function getServer() {
  if (!serverPromise) {
    serverPromise = require('../dist/main')
      .bootstrap({ listen: false })
      .then((app) => app.getHttpAdapter().getInstance());
  }
  return serverPromise;
}

module.exports = async (request, response) => {
  const server = await getServer();
  return server(request, response);
};
