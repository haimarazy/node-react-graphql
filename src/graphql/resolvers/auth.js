const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');

module.exports = {

    createUser: async args => {

        try {

            const existingUser = await User.findOne({ email: args.UserInput.email });
            if (existingUser) {
                throw new Error('User already exists');
            }
            const hashedPassword = await bcrypt.hash(args.UserInput.password, 12);

            const user = new User({
                email: args.UserInput.email,
                password: hashedPassword
            });

            const result = await user.save();

            return { ...result._doc, password: null };

        } catch (err) {
            throw err;
        }


    },
    login: async ({email, password}) => {
        const user = await User.findOne({email: email});
        if (!user) {
            throw new Error('User does not exist');
        }

        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            throw new Error('Password is incorrect');
        }

        const token = jwt.sign({
                userId: user.id,
                email: user.email
            }, 
            'secretkey', {
                expiresIn: '1h'
            }
        );

        return {
            userId: user.id,
            token: token,
            tokenExpiration: 1
        }

    }

}