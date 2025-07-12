import { MongoClient } from "mongodb";

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://user:dipankar2006@skillswap.nzva4pi.mongodb.net/?retryWrites=true&w=majority&appName=skillswap";
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // allow global var across module reloads in dev
  var _mongoClientPromise: Promise<MongoClient>;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
