require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Note = require('./models/person')

morgan.token('requestData', (request, response) => {
    return JSON.stringify(request.body)
})


const app = express()


// const requestLogger = (request, response, next) => {
//     console.log('Method:', request.method)
//     console.log('Path:  ', request.path)
//     console.log('Body:  ', request.body)
//     console.log('---')
//     next()
// }

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :requestData'))
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
// app.use(requestLogger)


// let persons = [
//     {
//         "id": 1,
//         "name": "Arto Hellas",
//         "number": "040-123456"
//     },
//     {
//         "id": 2,
//         "name": "Ada Lovelace",
//         "number": "39-44-5323523"
//     },
//     {
//         "id": 3,
//         "name": "Dan Abramov",
//         "number": "12-43-234345"
//     },
//     {
//         "id": 4,
//         "name": "Mary Poppendieck",
//         "number": "39-23-6423122"
//     }
// ]

const Person = require('./models/person')

app.get("/api/persons", (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

// app.get("/info", (request, response) => {
//     response.send(
//         `<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`
//     )
// })

app.get("/api/persons/:id", (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})

// app.delete("/api/persons/:id", (request, response) => {
//     const id = Number(request.params.id)
//     persons = persons.filter((person) => person.id !== id)
//     response.status(204).end()
// })

app.post("/api/persons", (request, response) => {

    const body = request.body

    if (!body.name && !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    // if (Person.find((person) => body.name === person.name)) {
    //     return response.status(400).json({
    //         error: 'name must be unique'
    //     })
    // }

    const person = new Person({
        name: body.name,
        number: body.number
    })
    
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})