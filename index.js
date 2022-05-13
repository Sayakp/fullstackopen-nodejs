const express = require("express");
const morgan = require("morgan")
const app = express();

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
    response.json(persons)
})

app.post('/api/persons', (request, response)=>{
    const body = request.body

    let error_message = null
    if (!body.name || !body.number)error_message="missing name or number"
    if (persons.some(person => person.name===body.name))error_message="The name already exists in the phonebook"

    if (error_message){
        return response.status(400).json(
            {
                error: error_message
            }
        )
    }

    const newPerson = {
        "id": Math.floor(Math.random()*10000000),
        "name": body.name,
        "number": body.number,
    }
    persons = persons.concat(newPerson)
    response.json(newPerson)
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

app.delete('/app/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on ${PORT}`)