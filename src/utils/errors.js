export function friendlyError(error, fallback) {
  if (error?.code === 'permission-denied') {
    return 'Setup needed: ask your admin to publish the latest Firestore rules';
  }
  return error?.message || fallback;
}
