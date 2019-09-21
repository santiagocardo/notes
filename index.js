const express = require('express')
const mongoose = require('mongoose')
const Note = require('./models/Note')
const cookieSession = require('cookie-session')
const md = require('marked')

const app = express()

mongoose.connect('mongodb://localhost:27017/notes', { useNewUrlParser: true })

app.set('view engine', 'pug')
app.set('views', 'views')
app.use(express.urlencoded({ extended: true }))
app.use(cookieSession({
  secret: 'una_cadena_secreta',
  maxAge: 24 * 60 * 60 * 1000
}))
app.use('/assets', express.static('assets'))

app.get('/', async (req, res, next) => {
  const notes = await Note.find()
  res.render('index', { notes })
})

app.get('/notes/new', async (req, res, next) => {
  const notes = await Note.find()
  res.render('new', { notes })
})

app.post('/', async (req, res, next) => {
  const data = {
    title: req.body.title,
    body: req.body.body
  }

  try {
    const note = new Note(data)
    await note.save()
    res.redirect('/')
  } catch (err) {
    return next(err)
  }
})

// Muestra una nota
app.get('/notes/:id', async (req, res, next) => {
  const notes = await Note.find()
  const note = await Note.findById(req.params.id)
  res.render('show', { notes: notes, currentNote: note, md: md })
})

// Muestra el formulario para editar
app.get('/notes/:id/edit', async (req, res, next) => {
  try {
    const notes = await Note.find()
    const note = await Note.findById({ _id: req.params.id })
    res.render('edit', { notes: notes, currentNote: note })
  } catch (err) {
    return next(err)
  }
})

// Actualiza una nota
app.patch("/notes/:id", async (req, res) => {
  const id = req.params.id
  const note = await Note.findById(id)

  note.title = req.body.title
  note.body = req.body.body

  try {
    await note.save()
  } catch (err) {
    return next(err)
  }

  res.status(204).send({})
})

// Elimina una nota
app.delete('/notes/:id', async (req, res, next) => {
  try {
    await Note.deleteOne({ _id: req.params.id })
    res.status(204).send({})
  } catch (err) {
    return next(err)
  }
})

app.listen(3000, () => console.log('Listening on port 3000'))