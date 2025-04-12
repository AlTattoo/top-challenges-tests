const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { startServer } = require('../integration-tests/helpers/server');

let mongoServer;
let server;

beforeAll(async () => {
  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Start Express server for integration tests
  server = await startServer(3001); // Use port 3001 for integration tests

  // Set global variable for API URL that can be used in tests
  global.API_URL = 'http://localhost:3001';
});

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  // Shutdown server
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  
  // Close MongoDB connection
  await mongoose.disconnect();
  await mongoServer.stop();
});
