const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
mongoose.connect(url).then(() => {
  console.log('Connected to MongoDB')
}).catch(error => {
  console.log('Error connecting: ',error.message)
})

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    unique: true,
    required: true
  },
  number: {
    type: String,
    validate: {
      validator: (v) => {
        return /(\d{3}-\d{5,})|(\d{2}-\d{6,})|\d{8,}/.test(v)
      }, message: props => `${props.value} is not a valid phone number`
    },
    required: true
  }
})
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
