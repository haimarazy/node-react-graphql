const bcrypt = require('bcryptjs');
const User = require('../../models/user');


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


    }

}