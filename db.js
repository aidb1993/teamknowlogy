const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

// Create a MongoDB client
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function storeMutation(dna, mutation) {
    try {
        // Connect to the MongoDB server
        await client.connect();

        // Get the database instance
        const db = client.db(dbName);

        // Check if the dna value already exists
        const existingMutation = await db.collection('dna').findOne({ dna });

        // If dna value doesn't exist, insert the mutation
        if (!existingMutation) {
            await db.collection('dna').insertOne({ dna, mutation });
        }
    } finally {
        // Close the client connection
        await client.close();
    }
}
// Function to get mutation statistics from the database
async function getStats() {
    try {
        // Connect to the MongoDB server
        await client.connect();

        // Get the database instance
        const db = client.db(dbName);

        // Perform the database operation to get the mutation statistics
        const countMutations = await db.collection('dna').countDocuments({ mutation: true });
        const countNoMutation = await db.collection('dna').countDocuments({ mutation: false });

        return { count_mutations: countMutations ? countMutations : 0, count_no_mutation: countNoMutation ? countNoMutation : 0 };
    } finally {
        // Close the client connection
        await client.close();
    }
}

module.exports = { storeMutation, getStats };
