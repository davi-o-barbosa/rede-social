function assembleUri() {
  const host = process.env.DATABASE_HOST || 'localhost';
  const port = process.env.DATABASE_PORT || '27017';
  const name = process.env.DATABASE_NAME;

  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;
  const login = user && password ? `${user}:${password}@` : '';

  return `mongodb://${login}${host}:${port}/${name}`;
}

export default () => ({
  node_env: process.env.NODE_ENV,
  server: {
    port: Number(process.env.SERVER_PORT) || 3000,
  },
  database: {
    uri: assembleUri(),
  },
});
