const HISTORY_KEY = "tickettout.featuredHistory"
const CLICKS_KEY = "tickettout.featuredClicks"

export type FeaturedEntry = {
  id: string
  partnerId: string
  startedAt: string // ISO
  endedAt: string | null
}

function readHistory(): FeaturedEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as FeaturedEntry[]) : []
  } catch {
    return []
  }
}

function writeHistory(history: FeaturedEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch {
    console.error("error saving featured history")
  }
}

export function getFeaturedHistory(): FeaturedEntry[] {
  return readHistory()
}

export function getCurrentFeatured(): FeaturedEntry | null {
  const history = readHistory()
  return history.find((entry) => entry.endedAt === null) ?? null
}

export function featurePartner(partnerId: string): void {
  const history = readHistory()
  const now = new Date().toISOString()

  const current = history.find((entry) => entry.endedAt === null)
  if (current?.partnerId === partnerId) return // déjà en avant

  const closed = history.map((entry) =>
    entry.endedAt === null ? { ...entry, endedAt: now } : entry,
  )

  const next: FeaturedEntry = {
    id: crypto.randomUUID(),
    partnerId,
    startedAt: now,
    endedAt: null,
  }

  writeHistory([...closed, next])
}

export function clearFeatured(): void {
  const history = readHistory()
  const now = new Date().toISOString()
  writeHistory(
    history.map((entry) =>
      entry.endedAt === null ? { ...entry, endedAt: now } : entry,
    ),
  )
}

function readClicks(): Record<string, number> {
  try {
    const raw = localStorage.getItem(CLICKS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, number>) : {}
  } catch {
    return {}
  }
}

export function getClicks(partnerId: string): number {
  return readClicks()[partnerId] ?? 0
}

export function getAllClicks(): Record<string, number> {
  return readClicks()
}

export function recordFeaturedClick(partnerId: string): void {
  try {
    const clicks = readClicks()
    clicks[partnerId] = (clicks[partnerId] ?? 0) + 1
    localStorage.setItem(CLICKS_KEY, JSON.stringify(clicks))
  } catch {
    console.error("error recording featured click")
  }
}
