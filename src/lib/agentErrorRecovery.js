/**
 * Agent Error Recovery System
 * Provides retry logic with exponential backoff, graceful fallbacks,
 * and error logging for the autonomous agent runtime.
 */

/**
 * Wraps an async function with retry logic and exponential backoff.
 * @param {Function} fn - Async function to retry
 * @param {Object} opts - Options
 * @param {number} opts.maxRetries - Maximum retry attempts (default: 2)
 * @param {number} opts.backoffMs - Initial backoff in ms (default: 1000)
 * @param {Function} opts.onRetry - Called on each retry with (attempt, error)
 * @returns {Promise<any>} - Result of fn, or throws after all retries fail
 */
export async function withRetry(fn, { maxRetries = 2, backoffMs = 1000, onRetry } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const delay = backoffMs * Math.pow(2, attempt);
        onRetry?.(attempt + 1, err, delay);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

/**
 * Generates a safe fallback action when the agent can't think.
 * Returns a mode-appropriate default action so the UI never breaks.
 */
export function getFallbackAction(category) {
  const fallbacks = {
    adhd: {
      reasoning: "API limit reached. Falling back to a gentle focus tip.",
      message: "I'm having a moment — but here's a tip: try writing down the ONE thing that matters most right now.",
      toolCalls: [
        { tool: "showNotification", params: { title: "ADHD Tip", message: "Try the Rule of Three: just pick 3 small things for today.", type: "info" } }
      ],
    },
    anxiety: {
      reasoning: "API limit reached. Suggesting immediate breathing.",
      message: "I couldn't connect right now, but remember: this feeling will pass. Try taking 3 slow breaths.",
      toolCalls: [
        { tool: "showNotification", params: { title: "Calm Reminder", message: "Inhale for 4... Hold for 7... Exhale for 8...", type: "info" } }
      ],
    },
    depression: {
      reasoning: "API limit reached. Validating effort.",
      message: "I'm here even when things are slow. You showed up today — that counts.",
      toolCalls: [
        { tool: "showNotification", params: { title: "Gentle Win", message: "You opened the app. That's a great first step.", type: "celebration" } }
      ],
    },
    dyspraxia: {
      reasoning: "API limit reached. Recommending physical focus.",
      message: "Take your time. Focus on just the step in front of you — nothing else matters right now.",
      toolCalls: [
        { tool: "showNotification", params: { title: "Slow & Steady", message: "One movement at a time. No rush.", type: "info" } }
      ],
    },
    dyslexia: {
      reasoning: "API limit reached. Suggesting accessibility tools.",
      message: "I'm having trouble thinking right now. Try using the Read Aloud button — it helps while I reconnect.",
      toolCalls: [
        { tool: "showNotification", params: { title: "Reader Tip", message: "Double-tap text to hear it read aloud.", type: "info" } }
      ],
    },
    dementia: {
      reasoning: "API limit reached. Providing orientation.",
      message: "Hello! I'm here to help. Take a moment and tell me what feels familiar today.",
      toolCalls: [
        { tool: "showNotification", params: { title: "Hello There", message: "It's a beautiful day to look at your favorite photos.", type: "info" } }
      ],
    },
  };
  return fallbacks[category] || {
    message: "I'm briefly unavailable, but I'll be back shortly. You're doing great.",
    toolCalls: [],
  };
}

/**
 * Creates a structured error log entry for the agent activity panel.
 */
export function createErrorLog(error, context = {}) {
  return {
    type: 'error',
    timestamp: Date.now(),
    message: error?.message || String(error),
    context,
    recovered: false,
  };
}
