import { initializeMessenger } from '../../messengers/initializeMessenger'

const inpageMessenger = initializeMessenger({ connect: 'inpage' })

inpageMessenger.reply('ping', () => {
  return 'pong'
})
