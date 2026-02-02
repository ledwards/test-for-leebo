// Debug logging utility for e2e tests
// Only logs when --debug flag is passed to playwright

const DEBUG = process.argv.includes('--debug')

export const debugLog = (...args) => {
  if (DEBUG) console.log(...args)
}

export const debugError = (...args) => {
  if (DEBUG) console.error(...args)
}

export const debugWarn = (...args) => {
  if (DEBUG) console.warn(...args)
}

export const debugInfo = (...args) => {
  if (DEBUG) console.info(...args)
}

// Progress indicator that always shows (even without --debug)
// Use for high-level test progress
export const testLog = (...args) => {
  console.log(...args)
}

export const isDebugMode = () => DEBUG
