const express = require('express')
const mongoose = require('mongoose')
const Note = require('./models/Note')
const User = require('./models/User')
const cookieSession = require('cookie-session')
const md = require('marked')
const PORT = process.env.PORT || 3000

const app = express()

mongoose.connect('mongodb+srv://admin-santiago:Test123@cluster0-0rr3j.mongodb.net/todolistDB', { useNewUrlParser: true })

app.set('view engine', 'pug')
app.set('views', 'views')
app.use(express.urlencoded({ extended: true }))
app.use(cookieSession({
  secret: 'una_cadena_secreta',
  maxAge: 24 * 60 * 60 * 1000
}))
app.use('/assets', express.static('assets'))

const requireUser = async (req, res, next) => {
  if (!res.locals.user) {
    return res.redirect('/login')
  }

  next()
} 

app.use(async (req, res, next) => {
  const userId = req.session.userId
  if (userId) {
    const user = await User.findById(userId)
    if (user) {
      res.locals.user = user
    } else {
      delete req.session.userId
    }
  }

  next()
})

// Muestra la lista de notas
app.get('/', requireUser, async (req, res, next) => {
  const notes = await Note.find({ user: res.locals.user })
  res.render('index', { notes })
})

// Muestra el formulario de crear una nota
app.get('/notes/new', requireUser, async (req, res, next) => {
  const notes = await Note.find({ user: res.locals.user })
  res.render('new', { notes })
})

// Crear una nota
app.post('/', requireUser, async (req, res, next) => {
  const data = {
    title: req.body.title,
    body: req.body.body,
    user: res.locals.user
  }

  try {
    const note = new Note(data)
    await note.save()
    res.redirect('/notes/' + note._id)
  } catch (err) {
    return next(err)
  }
})

// Muestra una nota
app.get('/notes/:id', async (req, res, next) => {
  const notes = await Note.find({ user: res.locals.user })
  const note = await Note.findById(req.params.id)
  res.render('show', { notes: notes, currentNote: note, md: md })
})

// Muestra el formulario para editar
app.get('/notes/:id/edit', requireUser, async (req, res, next) => {
  try {
    const notes = await Note.find({ user: res.locals.user })
    const note = await Note.findById({ _id: req.params.id })
    res.render('edit', { notes: notes, currentNote: note })
  } catch (err) {
    return next(err)
  }
})

// Actualizar una nota
app.patch("/notes/:id", requireUser, async (req, res) => {
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
app.delete('/notes/:id', requireUser, async (req, res, next) => {
  try {
    await Note.deleteOne({ _id: req.params.id })
    res.status(204).send({})
  } catch (err) {
    return next(err)
  }
})

app.get('/register', (req, res) => {
  res.render('register')
})

app.post('/register', async (req, res, next) => {
  try {
    const user = await User.create({
      email: req.body.email,
      password: req.body.password
    })
    res.redirect('/')
  } catch (err) {
    return next(err)
  }
  
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', async (req, res, next) => {
  try {
    const user = await User.authenticate(req.body.email, req.body.password)
    if (user) {
      req.session.userId = user._id
      return res.redirect('/')
    } else {
      res.render('login', { error: "Wrong email or password" })
    }
  } catch (err) {
    return next(err)
  }
})

app.get('/logout', requireUser, (req, res) => {
  res.session = null
  res.clearCookie('express:sess')
  res.clearCookie('express:sess.sig')
  res.redirect('/login')
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))