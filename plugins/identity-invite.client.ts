export default defineNuxtPlugin(() => {
  // Netlify's invitation email can land on the home page.
  // Keep the token in the fragment, which is never sent to the server.
  const hash = window.location.hash
  if (
    window.location.pathname !== '/admin' &&
    new URLSearchParams(hash.slice(1)).has('invite_token')
  ) {
    window.location.replace('/admin' + hash)
  }
})
