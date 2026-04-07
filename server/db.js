import pkg from "pg"

const { Pool } = pkg;

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "inventoryplus_xilong",
  password: "Aryan2008",
  port: 2008
})

