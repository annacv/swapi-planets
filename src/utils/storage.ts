export function readStringList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function writeStringList(key: string, items: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items))
  } catch {
    return
  }
}
