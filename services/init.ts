import { startSyncTasks } from './sync-service'

// only run in server
if (typeof window === 'undefined') {
  console.log('Starting sync service...')
  startSyncTasks()
}
