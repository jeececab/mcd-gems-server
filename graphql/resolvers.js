const User = require('../models/User');
const argon2 = require('argon2');

const resolvers = {
  Query: {
    users: () => User.find()
  },
  Mutation: {
    registerUser: async (_, { name, email, password }, { req }) => {
      try {
        if (password.length < 8) throw new Error('Password should have a minimum of 8 characters');

        const hashedPassword = await argon2.hash(password);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        req.session.userId = user.id;
        return { user };
      } catch (e) {
        let errorMessage;

        if (e.message.includes('duplicate') && e.message.includes('email')) {
          errorMessage = 'An account already exists with that email address';
        } else if (e.message.includes('duplicate') && e.message.includes('name')) {
          errorMessage = 'This user name is already taken';
        } else {
          errorMessage = e.message;
        }

        return { error: errorMessage };
      }
    },

    loginUser: async (_, { email, password }, { req }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) throw new Error('Invalid credentials');

        const valid = await argon2.verify(user.password, password);
        if (!valid) throw new Error('Invalid credentials');

        req.session.userId = user.id;
        return { user };
      } catch (e) {
        return { error: e.message };
      }
    }
  }
};

module.exports = resolvers;
