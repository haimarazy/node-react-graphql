# node-react-graphql
Steps to creating a full-fledged Web application with Node.js, React.js and GraphQL

Based on Academind YouTube video series - December 2018 through February 2019
https://www.youtube.com/watch?v=7giZGFDGnkc&feature=em-uploademail

https://academind.com/learn/node-js/graphql-with-node-react-full-app/

Step 001 - Creating a barebones Express application

Step 002 - Creating barebones GraphQL schema and resolver stubs

Step 003 - Creating GraphQL types for Event and EventInput

Step 004 - Adding Mongoose node package, Mongoose schema and model for Event, connection to MongoDB, and MongoDB logic to GrapthQL resolver stubs. Passing Mongo connection params to app via Nodemon env.

Step 005 - Creating GraphQL User type, User resolver logic (including password encryption), Mongoose schema and model for User.

Step 006 - Added dynamic relations between Event and User allowing multi-level nested data queries.

Step 007 - Code refactoring - extracted GraphQL schema and resolvers logic out of app.js file 

Step 008 - Code refactoring - added async/await syntax to resolvers logic