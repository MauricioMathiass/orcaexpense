import { createApp } from './app.js'
import { config } from './config.js'
import { prisma } from './db.js'

const server = createApp().listen(config.port, () => {
  console.log(`API do OrçaFY Expense em http://localhost:${config.port}`)
})

async function shutdown() {
  server.close()
  await prisma.$disconnect()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
