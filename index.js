require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()

const Person = require('./models/person')

app.use(express.static('build'))

morgan.token('post-data', (request) => {
  if (request.method === 'POST'){
    return JSON.stringify(request.body)
  }else{
    return ''
  }
})

app.use(express.json())
app.use(morgan(':method :url :res[content-length] - :response-time ms :post-data'))


app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body
  const person = new Person({
    name: name,
    number: number,
  })
  person.save().then(newPerson => {
    response.json(newPerson)
  }).catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person.collection.countDocuments().then((result) => {
    response.send(`<p>Phonebook has info for ${result} people</p>
                         <div>${Date()}</div>`)
  }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  const person = {
    name: name,
    number: number
  }
  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' }).then(updatedPerson => {
    response.json(updatedPerson)
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id).then(() => {
    response.status(204).end()
  }).catch(error => {
    next(error)
  })
})

const errorHandler= (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError'){
    return response.status(400).send({ error: 'malformatted if' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})
