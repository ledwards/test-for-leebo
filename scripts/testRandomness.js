// Test randomness of Math.random() to ensure it's sufficiently random
// This helps diagnose if duplicate issues are due to poor randomness

const NUM_SAMPLES = 100000
const POOL_SIZE = 12 // Simulate base pool size

console.log('Testing Math.random() randomness...\n')

// Test 1: Uniform distribution
const buckets = new Array(10).fill(0)
for (let i = 0; i < NUM_SAMPLES; i++) {
  const r = Math.random()
  const bucket = Math.floor(r * 10)
  buckets[bucket]++
}

console.log('Test 1: Uniform Distribution (10 buckets)')
const expectedPerBucket = NUM_SAMPLES / 10
const chiSquare = buckets.reduce((sum, count) => {
  const diff = count - expectedPerBucket
  return sum + (diff * diff) / expectedPerBucket
}, 0)
console.log(`  Expected per bucket: ${expectedPerBucket}`)
console.log(`  Observed: ${buckets.map(c => c.toFixed(0)).join(', ')}`)
console.log(`  Chi-square: ${chiSquare.toFixed(2)} (critical: 16.92 for df=9, α=0.05)`)
console.log(`  Result: ${chiSquare < 16.92 ? '✅ PASS' : '❌ FAIL'}\n`)

// Test 2: Simulate base selection (like in pack generation)
console.log('Test 2: Simulating Base Selection (12 unique bases, 6 packs)')
const baseNames = Array.from({ length: POOL_SIZE }, (_, i) => `Base${i}`)
const selectionCounts = new Map()
const numPods = 10000

for (let pod = 0; pod < numPods; pod++) {
  const selected = new Set()
  for (let pack = 0; pack < 6; pack++) {
    // Simulate random selection (no duplicate prevention across packs)
    const index = Math.floor(Math.random() * baseNames.length)
    selected.add(baseNames[index])
  }
  
  // Count duplicates
  const counts = new Map()
  for (let pack = 0; pack < 6; pack++) {
    const index = Math.floor(Math.random() * baseNames.length)
    const name = baseNames[index]
    counts.set(name, (counts.get(name) || 0) + 1)
  }
  
  // Track max duplicates in this pod
  let maxCount = 0
  counts.forEach(count => {
    maxCount = Math.max(maxCount, count)
  })
  
  selectionCounts.set(maxCount, (selectionCounts.get(maxCount) || 0) + 1)
}

console.log('  Distribution of max duplicates per pod:')
selectionCounts.forEach((count, maxDup) => {
  const percentage = (count / numPods * 100).toFixed(2)
  console.log(`    ${maxDup} copies: ${count} pods (${percentage}%)`)
})

// Expected: With 12 bases and 6 selections, probability of at least one duplicate
// P(duplicate) = 1 - P(all unique) = 1 - (12! / (12^6 * 6!))
// = 1 - (12 * 11 * 10 * 9 * 8 * 7) / (12^6) ≈ 0.777
const expectedDuplicateRate = 1 - (12 * 11 * 10 * 9 * 8 * 7) / Math.pow(12, 6)
const observedDuplicateRate = (numPods - (selectionCounts.get(1) || 0)) / numPods
console.log(`\n  Expected duplicate rate: ${(expectedDuplicateRate * 100).toFixed(2)}%`)
console.log(`  Observed duplicate rate: ${(observedDuplicateRate * 100).toFixed(2)}%`)
console.log(`  Difference: ${((observedDuplicateRate - expectedDuplicateRate) * 100).toFixed(2)}%`)
console.log(`  Result: ${Math.abs(observedDuplicateRate - expectedDuplicateRate) < 0.02 ? '✅ PASS' : '❌ FAIL'}\n`)

// Test 3: Check for patterns in random sequence
console.log('Test 3: Pattern Detection (runs test)')
let runs = 0
let lastValue = null
let currentRun = 1

for (let i = 0; i < 1000; i++) {
  const value = Math.random() < 0.5 ? 0 : 1
  if (lastValue !== null && value !== lastValue) {
    runs++
    currentRun = 1
  } else {
    currentRun++
  }
  lastValue = value
}

const expectedRuns = (1000 + 1) / 2 // Expected runs for random sequence
const z = (runs - expectedRuns) / Math.sqrt((1000 - 1) / 4)
console.log(`  Observed runs: ${runs}`)
console.log(`  Expected runs: ${expectedRuns.toFixed(1)}`)
console.log(`  Z-score: ${z.toFixed(3)} (critical: ±1.96)`)
console.log(`  Result: ${Math.abs(z) < 1.96 ? '✅ PASS' : '❌ FAIL'}\n`)

console.log('Randomness test complete!')
