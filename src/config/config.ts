export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  database: {
    connectionString: process.env.MONGO_URL,
  },
  panns: {
    baseUrl: process.env.PANNS_API_URL || 'http://localhost:8002',
  },
  whisper: {
    serviceUrl: process.env.WHISPER_SERVICE_URL || 'http://localhost:8000',
  },

});
