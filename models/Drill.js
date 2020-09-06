const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      default: '',
      maxlength: 300
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      required: true
    }
  },
  { timestamps: true }
);

const Drill = mongoose.model('Drill', userSchema);

module.exports = Drill;
