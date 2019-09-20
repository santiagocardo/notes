const express = require('express')
const app = express()

const logger = (req, res, next) => {
  console.log('Nueva petición HTTP')
  next()
}

app.set('view engine', 'pug')
app.set('views', 'views')
app.use(express.urlencoded({ extended: true }))
app.use('/static', express.static('public'))
app.use(logger)

app.get('/', (req, res) => {
  const name = req.query.name
  const age = req.query.age

  res.render('index', { name, age })
})

app.get('/notes/new', (req, res) => {
  res.render('new')
})

app.post('/notes', (req, res) => {
  console.log(req.body)
  res.redirect('/')
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Algo salió mal')
})

app.listen(3000, () => console.log('Listening on port 3000'))