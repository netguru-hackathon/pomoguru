const createSlack = require('./slack')

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
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
      const progress = 1 - (timeLeft / onePomodoroInSeconds)
      onTimeChangeListener({ timeLeft, progress })
    }
  }

  function onTimeChange(listener) {
    onTimeChangeListener = listener
  }

  function getTimeLeft() {
    return timeLeft
  }

  return {
    start,
    pause,
    stop,
    onTimeChange,
    getTimeLeft
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

  setTimeLeft(timer.getTimeLeft())
  hideElement(pauseButton)

  startButton.addEventListener('click', () => {
    hideElement(startButton)
    showElement(pauseButton)
    timer.start()
    slack.focusStart()
  })

  pauseButton.addEventListener('click', () => {
    hideElement(pauseButton)
    showElement(startButton)
    timer.pause()
    slack.focusEnd()
  })

  stopButton.addEventListener('click', () => {
    hideElement(pauseButton)
    showElement(startButton)
    timer.stop()
    slack.focusEnd()
  })

  timer.onTimeChange(({ timeLeft, progress }) => {
    setTimeLeft(timeLeft)
    // touchbar.setValue(progress)
  })

  function setTimeLeft(value) {
    timeLeftElement.innerHTML = formatTime(value)
  }

  function hideElement(element) {
    element.classList.add('hidden')
  }

  function showElement(element) {
    element.classList.remove('hidden')
  }

  function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = timeInSeconds % 60
    return `${minutes}:${addLeadingZero(seconds)}`
  }

  function addLeadingZero(value) {
    return value < 10 ? `0${value}` : value
  }
}