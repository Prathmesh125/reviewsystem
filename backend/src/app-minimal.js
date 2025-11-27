require('dotenv').config()
const express = require('express')

console.log('Express loaded successfully')
const app = express()
console.log('App created successfully')

const PORT = process.env.PORT || 3001

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
})