function assembleUri() {
  const prefix = process.env.DATABASE_PREFIX || 'mongodb';
  const host = process.env.DATABASE_HOST || 'localhost';
  const port = process.env.DATABASE_PORT;
  const name = process.env.DATABASE_NAME;
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;
  const login = user && password ? `${user}:${password}@` : '';

  return `${prefix}://${login}${host}${port ?? `:${port}`}/${name}`;
}

export default () => ({
  node_env: process.env.NODE_ENV || 'development',
  server: {
    port: Number(process.env.SERVER_PORT) || 3000,
  },
  database: {
    uri: assembleUri(),
  },
  bcrypt: {
    saltRounds: Number(process.env.SALT_ROUNDS) || 10,
  },
  jwt: {
    expiresIn: process.env.EXPIRE_TIME || '60s',
    secret: process.env.SECRET || 'SUPER_SECRET_CODE',
  },
});
