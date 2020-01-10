const express = require('express')
const app = express()

app.use(express.static('public'));

const port = 3005

app.get('/', (req, res) => res.sendFile('index.html'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))