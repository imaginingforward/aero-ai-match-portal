// Test script to verify MongoDB connection and functionality
// Using ES module format
import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function testMongoDBConnection() {
  // MongoDB connection info from environment variables
  const connectionString = process.env.VITE_MONGODB_CONNECTION_STRING;
  const dbName = process.env.VITE_MONGODB_DATABASE;
  const collectionName = process.env.VITE_MONGODB_COLLECTION;
  
  if (!connectionString || !dbName || !collectionName) {
    console.error('Missing MongoDB configuration in .env file');
    return;
  }
  
  console.log('Starting MongoDB connection test...');
  let client = null;
  
  try {
    // Step 1: Initialize the MongoDB connection
    console.log('Connecting to MongoDB...');
    client = new MongoClient(connectionString);
    await client.connect();
    console.log('Successfully connected to MongoDB');
    
    // Step 2: Access the database and collection
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Step 3: Attempt to fetch opportunities
    console.log(`Querying collection: ${collectionName}...`);
    const opportunities = await collection.find({}).limit(10).toArray();
    
    // Step 4: Display the results
    console.log(`Successfully retrieved ${opportunities.length} opportunities from MongoDB`);
    
    // Display the first item for verification
    if (opportunities.length > 0) {
      console.log('First opportunity:');
      console.log(JSON.stringify(opportunities[0], null, 2));
    } else {
      console.log('No opportunities found in the collection');
    }
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('MongoDB test failed:', error);
    console.error(error.stack);
  } finally {
    // Step 5: Close the connection
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the test
testMongoDBConnection();
