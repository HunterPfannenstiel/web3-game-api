import pg, { PoolConfig } from "pg";

let customerPool: pg.Pool;

const initializePool = () => {
  if (customerPool) return;
  const dbUser = {
    user: "web3_api",
    password: process.env.DATABASE_PASSWORD!,
  };

  const credentials: PoolConfig = {
    host: "localhost",
    port: 5432,
    database: "machoverse",
    ...dbUser,
  };
  customerPool = new pg.Pool(credentials);
};

export const apiQuery = async (query: string, params?: any[]) => {
  initializePool();
  const connection = await customerPool.connect();
  try {
    const res = await connection.query(query, params);
    return res;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};
