require("dotenv").config()
const express = require("express");
const morgan = require("morgan")
const app = express();

const Person = require("./models/person")

app.use(express.static("build"))

morgan.token('post-data', (request, response) => {
    if (request.method === 'POST'){
        return JSON.stringify(request.body)
    }else{
        return ""
    }
})

app.use(express.json())
app.use(morgan(':method :url :res[content-length] - :response-time ms :post-data'))


app.get("/api/persons", (request, response)=> {
    Person.find({}).then(persons=>{
        response.json(persons)
    })
})

app.post('/api/persons', (request, response)=>{
    const body = request.body

    if (!body.name || !body.number){
        return response.status(400).json(
            {
                error: "missing name or number"
            }
        )
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })
    person.save().then(newPerson=>{
        response.json(newPerson)
    })
})

app.get("/info", (request, response, next)=>{
    Person.collection.countDocuments().then((result)=>{
    response.send(`<p>Phonebook has info for ${result} people</p>
                         <div>${Date()}</div>`)
    }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next)=>{
    Person.findById(request.params.id).then(person=>{
        response.json(person)
    }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const person = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(request.params.id, person, {new: true}).then(updatedPerson => {
        response.json(updatedPerson)
    }).catch(error => next(person))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id).then(result =>{
        response.status(204).end()
    }).catch(error =>{
        next(error)
    })
})

const errorHandler= (error, request, response, next) =>{
    console.error(error.message)
    if (error.name === "CastError"){
        return response.status(400).send({error: "malformatted if"})
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log(`Server running on ${PORT}`)
})
