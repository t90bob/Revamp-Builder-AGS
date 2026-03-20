/**
 * Wraps project.generate() with retry logic.
 * The Stitch API intermittently returns outputComponents[0].designSystem
 * instead of outputComponents[0].design, causing an SDK crash.
 * Retrying usually resolves it.
 */
export async function generateWithRetry(project, prompt, deviceType, maxAttempts = 3) {
  let lastError
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const screen = await project.generate(prompt, deviceType || 'DESKTOP')
      return screen
    } catch (e) {
      lastError = e
      if (e.message?.includes('screens') || e.message?.includes('undefined')) {
        console.warn(`Stitch generate attempt ${i + 1} failed, retrying...`)
        await new Promise(r => setTimeout(r, 1500))
        continue
      }
      throw e // non-retryable error
    }
  }
  throw lastError
}
