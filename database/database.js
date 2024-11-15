const mongodb = require("mongodb");

const client = mongodb.MongoClient;

let db;

async function create_database() {
  try {
    const connections_To_Server = await client.connect("mongodb://127.0.0.1:27017");
    db = connections_To_Server.db("blog-platform");
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

function getdb() {
  return db;
}

module.exports = {
  create: create_database,
  getdb: getdb,
};
