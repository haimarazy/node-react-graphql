const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const {buildSchema} = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

// app.get('/', (req, res, next) => {
//     res.send('Hello World!');
// })

const defaultUserId = '5c8edb029ab06418b3d11efa';

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`

        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
            _id: ID!
            email: String!
            password: String
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(UserInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {

        events: () => {
            return Event
                .find()
                .then(events => {
                    return events.map(event => {
                        return { ...event._doc }
                    })
                })
                .catch(err => {
                    throw err;
                });
        },
        createEvent: args => {

            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date),
                creator: defaultUserId
            });

            let createdEvent;

            return event
                .save()
                .then(result => {
                    createdEvent = { ...result._doc };
                    return User.findById(defaultUserId);
                })
                .then( user => {

                    if (!user) {
                        throw new Error('User not found');
                    }

                    user.createdEvents.push(event);
                    return user.save();

                })
                .then( result => {
                    return createdEvent;
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                });
        },
        createUser: args => {

            return User.findOne({ email: args.UserInput.email})
            .then( user => {
                if ( user ) {
                    throw new Error('User already exists');
                }
                return bcrypt
                    .hash(args.UserInput.password, 12)
            })
            .then( hashedPassword => {
                const user = new User({
                    email: args.UserInput.email,
                    password: hashedPassword
                });
                return user.save();
            })
            .then( result => {
                return { ...result._doc, password: null };
            })
            .catch( err => {
                throw err;
            });

        }
    },
    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-gqxaz.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`
).then(() => {
    app.listen(3000);
}).catch(err => {
    console.log(err);
});

