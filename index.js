const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const app = express()

app.use(bodyParser.json())
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :body :status :res[content-length] - :response-time ms'))

const port = process.env.port || 3001
const baseUrl = '/api'

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

let persons = [
  {
    name: "Aku Ankka",
    number: "040-123456",
    id: 1
  },
  {
    name: "Iines Ankka",
    number: "040-234567",
    id: 2
  },
  {
    name: "Roope Ankka",
    number: "040-345678",
    id: 3
  },
  {
    name: "Hupu Ankka",
    number: "040-456789",
    id: 4
  }
]

const generateRandomID = () => {
  const ids = persons.map(p => p.id)
  function random() { return Math.floor(Math.random() * 50000) + 1 }

  function getRandomId() {
    let id = random()
    setTimeout(() => {
      if (ids.includes(id)) {
        getRandomId()
      }
    }, 1000)
    return id
  }

  const id = getRandomId()

  if (ids.includes(id)) {
    console.log('warning: maximum number of person ids exceeded, duplicate ids possible')
  }

  return id
}

const validatePostRequest = (name, number) => {
  let errors = []
  function errorMsg(msg) { return ({error: msg}) }

  function missingField() {
    let errors = []
    if (name === undefined) errors.push('name')
    if (number === undefined) errors.push('number')
    return errors
  }

  if (persons.map(p => p.name).includes(name)) {
    errors.push({status: 409, msg: errorMsg(`name \'${name}\' already exists`)})
  }

  missingField().forEach(mf => 
      errors.push({status: 400, msg: errorMsg(`field \'${mf}\' is required`)}))

  return errors.length ? errors : null
}

app.delete(`${baseUrl}/persons/:id`, (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(p => p.id !== id)

  res.status(204).end()
})

app.get(`${baseUrl}/persons`, (req, res) => {
  res.json(persons)
})

app.get(`${baseUrl}/persons/:id`, (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(p => p.id === id)

  person ? res.json(person) : res.status(404).end()
})

app.post(`${baseUrl}/persons`, (req, res) => {
  const body = req.body
  const errors = validatePostRequest(body.name, body.number)

  if (errors) {
    return res.status(errors[0].status).json(errors.map(e => e.msg))
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateRandomID()
  }

  persons = persons.concat(person)
  res.json(person)
})

app.get('/info', (req, res) => {
  const info = `<p>puhelinluettelossa ${persons.length} henkilön tiedot</p>
    ${new Date()}`
  res.send(info)
})