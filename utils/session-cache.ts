interface SessionPayload {
  payload: {
    data: Record<string, unknown>
    _errors: Record<string, unknown>
  }
}

export function updateSessionCachedData<T>(
  key: string,
  app: SessionPayload,
  sharedData: { value: T | undefined | null },
  value: T,
) {
  sharedData.value = value
  app.payload.data[key] = value
  app.payload._errors[key] = null
}

// Nuxt owns this payload per app/request. No module-level or persistent cache.
export function getSessionCachedData<T>(
  key: string,
  app: SessionPayload,
  context: { cause: string },
): T | undefined {
  // Explicit retries must reach the API; failed responses are never cached.
  if (context.cause !== 'initial' || app.payload._errors[key]) return undefined
  return (app.payload.data[key] ?? undefined) as T | undefined
}
