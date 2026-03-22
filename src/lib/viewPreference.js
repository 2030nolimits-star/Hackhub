const key = (userId) => `fello_view_${userId}`

export function getPreferredView(userId) {
  if (!userId) return null
  return localStorage.getItem(key(userId)) || null
}

export function setPreferredView(userId, view) {
  if (!userId) return
  localStorage.setItem(key(userId), view)
}

export function clearPreferredView(userId) {
  if (!userId) return
  localStorage.removeItem(key(userId))
}
