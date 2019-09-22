const mongoose = require('mongoose')

const NoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: { type: String, required: [true, "is required"] },
  body: { type: String },
  image: String
})

NoteSchema.methods.truncateBody = function() {
  if (this.body && this.body.length > 75) {
    return this.body.substring(0, 70) + " ..."
  }
  return this.body;
}

module.exports = mongoose.model("Note", NoteSchema)