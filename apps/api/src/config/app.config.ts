import * as path from 'node:path';

export function appConfig() {
  return {
    app: {
      port: +process.env.API_PORT || 3000,
      prefix: process.env.API_ROOT_PATH || '',
      url: process.env.API_URL || 'http://localhost:3000',
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
      frontendUrlPublic:
        process.env.FRONTEND_PUBLIC_URL || 'http://localhost:5174',
    },
    fusionauth: {
      apiKey: process.env.FUSIONAUTH_API_KEY,
      applicationId: process.env.FUSIONAUTH_APPLICATION_ID,
      url: process.env.FUSIONAUTH_URL || 'http://127.0.0.1:9011',
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: +process.env.REDIS_PORT || '6379',
    },

    features: {
      redis: process.env.FEATURE_FLAG_ENABLE_REDIS === 'true' || false,
    },

    queue: {
      inputDirectory: path.resolve(
        process.env.QUEUE_INPUT_DIRECTORY || './misc/input',
      ),
    },
    sftp: {
      username: process.env.SFTP_USERNAME,
      url: process.env.SFTP_URL,
      port: process.env.SFTP_PORT,
      password: process.env.SFTP_PASSWORD || '',
      pathKey: process.env.SFTP_PRIVATE_KEY_PATH || '',
      path: process.env.SFTP_XML_PATH,
      pathEspe: process.env.SFTP_XML_ESPE,
      pathProcessed: process.env.SFTP_XML_PROCESSED,
      pathCertificate: process.env.SFTP_CERTIFICATE_PATH,
    },
  };
}

export const AppConfig = {
  App: {
    Port: 'app.port',
    Prefix: 'app.prefix',
    Url: 'app.url',
    FrontendUrl: 'app.frontendUrl',
    FrontendUrlPublic: 'app.frontendUrlPublic',
  },
  Fusionauth: {
    ApiKey: 'fusionauth.apiKey',
    ApplicationId: 'fusionauth.applicationId',
    Url: 'fusionauth.url',
  },
  Redis: {
    Host: 'redis.host',
    Port: 'redis.port',
  },
  Features: {
    Redis: 'features.redis',
  },
  Queue: {
    InputDirectory: 'queue.inputDirectory',
  },
  Sftp: {
    Username: 'sftp.username',
    Url: 'sftp.url',
    Port: 'sftp.port',
    Password: 'sftp.password',
    PathKey: 'sftp.pathKey',
    Path: 'sftp.path',
    PathEspe: 'sftp.pathEspe',
    PathProcessed: 'sftp.pathProcessed',
    PathCertificate: 'sftp.pathCertificate',
  },
};
