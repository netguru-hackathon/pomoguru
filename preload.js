const createSlack = require('./slack')

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

  const slack = createSlack()
  const timer = createTimer()
  const pomodoro = createPomodoro({
    slack,
    timer
  })
})


function createTimer() {
  const oneSecond = 1000
  const onePomodoroInSeconds = 25 * 60
  let timerHandler
  let timeLeft = onePomodoroInSeconds
  let onTimeChangeListener

  function start() {
    console.log('start')
    if (!timerHandler) {
      timerHandler = setInterval(tickInterval, oneSecond)
    }
  }

  function pause() {
    console.log('pause')
    clearTickInterval()
  }

  function stop() {
    console.log('stop')
    clearTickInterval()
    changeTime(onePomodoroInSeconds)
  }

  function tickInterval() {
    changeTime(timeLeft - 1)

    if (timeLeft === 0) {
      console.log('Pomodoro ends')
      stop()
    }
  }

  function clearTickInterval() {
    clearInterval(timerHandler)
    timerHandler = null
  }

  function changeTime(value) {
    timeLeft = value

    if (onTimeChangeListener) {
      onTimeChangeListener(timeLeft)
    }
  }

  function onTimeChange(listener) {
    onTimeChangeListener = listener
  }

  return {
    start,
    pause,
    stop,
    onTimeChange
  }
}

function createPomodoro({
  slack,
  timer
}) {
  const startButton = document.querySelector('#start')
  const pauseButton = document.querySelector('#pause')
  const stopButton = document.querySelector('#stop')
  const timeLeftElement = document.querySelector('#timeLeft')
  console.log('create Pomodoro')

  startButton.addEventListener('click', () => {
    timer.start()
    slack.focusStart()
  })

  pauseButton.addEventListener('click', () => {
    timer.pause()
    slack.focusEnd()
  })

  stopButton.addEventListener('click', () => {
    timer.stop()
    slack.focusEnd()
  })

  timer.onTimeChange(timeLeft => {
    timeLeftElement.innerHTML = formatTime(timeLeft)
  })

  function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = timeInSeconds % 60
    return `${minutes}:${addLeadingZero(seconds)}`
  }

  function addLeadingZero(value) {
    return value < 10 ? `0${value}` : value
  }
}