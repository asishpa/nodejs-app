const express = require('express');
const mongoose = require('mongoose');
const graphql = require('graphql');
const { graphqlHTTP } = require('express-graphql');
const { GraphQLObjectType, GraphQLSchema, GraphQLList, GraphQLID, GraphQLInt, GraphQLString } = graphql;
const User = require('./models/User'); // Import the User model

const app = express();
const PORT = 5000;

// MongoDB Atlas connection string
const dbPassword = encodeURIComponent(process.env.MONGO_PASSWORD.trim()) 
const dbURL = `mongodb+srv://adminPersonnnel:${dbPassword}@devcluster.grn9xzq.mongodb.net/?retryWrites=true&w=majority&appName=DevCluster`;

mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected...');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
    })
});

const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        getAllUsers: {
            type: new GraphQLList(UserType),
            resolve() {
                return User.find();
            }
        },
        findUserById: {
            type: UserType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return User.findById(args.id);
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        createUser: {
            type: UserType,
            args: {
                firstName: { type: GraphQLString },
                lastName: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            resolve(parent, args) {
                const user = new User({
                    firstName: args.firstName,
                    lastName: args.lastName,
                    email: args.email,
                    password: args.password
                });
                return user.save();
            }
        }
    }
});

const schema = new GraphQLSchema({ query: RootQuery, mutation: Mutation });

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true,
}));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
