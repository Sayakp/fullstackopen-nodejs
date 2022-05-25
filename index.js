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


let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

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
        "name": body.name,
        "number": body.number,
    })
    person.save().then(newPerson=>{
        response.json(newPerson)
    })
})

app.get("/info", (request, response)=>{
    response.send(`<p>Phonebook has info for ${persons.length} people</p>
                         <div>${Date()}</div>`)
})

app.get('/api/persons/:id', (request, response)=>{
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    console.log(person)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.put('/api/persons/:id', (request, response)=>{
    const id = Number(request.params.id)

})

const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log(`Server running on ${PORT}`)
})
