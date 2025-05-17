import { exec } from 'child_process'
import chokidar from 'chokidar'

const capitalizeFirstLetter = str => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const buildProcess = {
  app: null,
  background: null,
  content: null,
  inpage: null,
}

const build = chunk => {
  if (buildProcess[chunk]) {
    console.log(
      `\x1b[1m\x1b[33mTerminating previous ${capitalizeFirstLetter(chunk)} build...\x1b[0m`
    )
    exec(`taskkill /PID ${buildProcess[chunk].pid} /F /T`, error => {
      if (error) console.error(`Failed to kill ${chunk} process:, error`)
    })
  }

  buildProcess[chunk] = exec(`yarn build:${chunk}`, { shell: true })

  buildProcess[chunk].stdout.on('data', data => process.stdout.write(data))

  buildProcess[chunk].stderr.on('data', data => process.stderr.write(data))

  buildProcess[chunk].on('close', code => {
    console.log(
      `\x1b[1m\x1b[32m${capitalizeFirstLetter(chunk)} build process exited with code ${code}\x1b[0m`
    )
    buildProcess[chunk] = null
  })

  console.log(
    `\x1b[1m\x1b[34m${capitalizeFirstLetter(chunk)} build triggered!\x1b[0m`
  )
}

chokidar
  .watch('src', {
    ignored: ['src/background', 'src/content', 'src/inpage'],
  })
  .on('change', () => build('app'))

chokidar.watch('src/background').on('change', () => build('background'))

chokidar.watch('src/content').on('change', () => build('content'))

chokidar.watch('src/inpage').on('change', () => build('inpage'))

build('app')
build('background')
build('content')
build('inpage')
