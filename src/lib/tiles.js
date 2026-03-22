// Source of truth for all 6 dashboard tiles.
// dashboard_tiles in the DB is an ordered array of these keys —
// first = highest priority (shown top-left on the dashboard).

import { Puzzle, Target, Wind, BookOpen, MessageCircle, Users } from 'lucide-react'

export const TILE_DEFS = {
  tasks: {
    key: 'tasks',
    Icon: Puzzle,
    title: 'Task Breakdown',
    desc: 'Break any goal into doable micro-steps with auto-scheduling.',
    color: '#7c6fe0',
  },
  focus: {
    key: 'focus',
    Icon: Target,
    title: 'Focus Timer',
    desc: 'Pomodoro sessions tuned for your energy and attention span.',
    color: '#f0952a',
  },
  wellbeing: {
    key: 'wellbeing',
    Icon: Wind,
    title: 'Wellbeing',
    desc: 'Breathing exercises, meditation, and gentle movement prompts.',
    color: '#2db896',
  },
  journal: {
    key: 'journal',
    Icon: BookOpen,
    title: 'Journal & Mood',
    desc: 'Daily reflections, mood tracking, and gratitude journal.',
    color: '#e06fa0',
  },
  therapy: {
    key: 'therapy',
    Icon: MessageCircle,
    title: 'Therapy Support',
    desc: 'Evidence-informed chat support and verified therapist matching.',
    color: '#5b9bd5',
  },
  community: {
    key: 'community',
    Icon: Users,
    title: 'Community',
    desc: 'Peer support groups, buddy matching, and body-doubling sessions.',
    color: '#6db56d',
  },
}

export const ALL_TILE_KEYS = Object.keys(TILE_DEFS)

// Build ordered tile array: selected keys first, then the rest
export function buildTileOrder(selectedKeys) {
  const rest = ALL_TILE_KEYS.filter(k => !selectedKeys.includes(k))
  return [...selectedKeys, ...rest]
}
