const argon2 = require('argon2');
const sharp = require('sharp');
const User = require('../models/User');
const Drill = require('../models/Drill');

const resolvers = {
  User: {
    drills: async (_, {}, { auth, req }) => {
      if (!auth) throw new Error('Not authenticated');

      const drills = await Drill.find({ user_id: req.session.userId });

      return drills;
    }
  },
  Query: {
    me: async (_, {}, { auth, req }) => {
      if (!auth) throw new Error('Not authenticated');

      const user = await User.findOne({ _id: req.session.userId });

      return user;
    }
  },
  Mutation: {
    registerUser: async (_, { name, username, email, password }, { req }) => {
      try {
        if (password.length < 8) throw new Error('Password should have a minimum of 8 characters');

        const hashedPassword = await argon2.hash(password);
        const user = new User({ name, username, email, password: hashedPassword });
        await user.save();

        req.session.userId = user.id;
        return user;
      } catch (e) {
        let errorMessage;

        if (e.message.includes('duplicate') && e.message.includes('email')) {
          errorMessage = 'An account already exists with that email address';
        } else if (e.message.includes('duplicate') && e.message.includes('username')) {
          errorMessage = 'This username is already taken';
        } else {
          errorMessage = e.message;
        }

        throw new Error(errorMessage);
      }
    },

    loginUser: async (_, { email, password }, { req }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) throw new Error('Invalid credentials');

        const valid = await argon2.verify(user.password, password);
        if (!valid) throw new Error('Invalid credentials');

        req.session.userId = user.id;
        return user;
      } catch (e) {
        throw new Error(e.message);
      }
    },

    logoutUser: async (_, {}, { req, res }) => {
      return new Promise(resolve =>
        req.session.destroy(e => {
          res.clearCookie('qid');
          if (e) {
            console.log(e);
            resolve(false);
            return;
          }

          resolve(true);
        })
      );
    },

    uploadAvatar: async (_, { file }, { auth, req }) => {
      if (!auth) return { error: 'Not authenticated' };

      try {
        const { filename, createReadStream } = await file;

        if (!filename.match(/\.(jpg|jpeg|png)$/)) throw new Error('Wrong file format');

        const stream = createReadStream();
        const chunks = [];
        for await (let chunk of stream) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        const croppedBuffer = await sharp(buffer).png().resize({ width: 250, height: 250 }).toBuffer();
        const base64 = croppedBuffer.toString('base64');

        const updatedUser = await User.findByIdAndUpdate(
          { _id: req.session.userId },
          { avatar: base64 },
          { new: true }
        );

        return updatedUser;
      } catch (e) {
        throw new Error(e.message);
      }
    },

    deleteAvatar: async (_, {}, { auth, req }) => {
      if (!auth) return { error: 'Not authenticated' };

      try {
        await User.findByIdAndUpdate({ _id: req.session.userId }, { avatar: null });
        return true;
      } catch (e) {
        throw new Error(e.message);
      }
    },

    uploadAccountInfo: async (_, { name, email, bio }, { auth, req }) => {
      if (!auth) return { error: 'Not authenticated' };

      try {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: req.session.userId },
          { name, email, bio },
          { new: true }
        );

        return updatedUser;
      } catch (e) {
        throw new Error(e.message);
      }
    },

    createDrill: async (_, { title, description }, { auth, req }) => {
      if (!auth) return { error: 'Not authenticated' };

      try {
        const drill = new Drill({ title, description, user_id: req.session.userId });
        await drill.save();

        return { drill };
      } catch (e) {
        let errorMessage;

        if (e.message.includes('duplicate') && e.message.includes('title')) {
          errorMessage = 'A drill already exists with that title';
        } else {
          errorMessage = e.message;
        }

        throw new Error(errorMessage);
      }
    }
  }
};

module.exports = resolvers;
