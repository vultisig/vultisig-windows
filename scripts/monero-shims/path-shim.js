function normalize(p) { return p || '/' }
function join() { return Array.from(arguments).filter(Boolean).join('/') }
function dirname(p) { return (p || '').split('/').slice(0, -1).join('/') || '/' }
function resolve() { return Array.from(arguments).pop() || '/' }
function basename(p) { return (p || '').split('/').pop() || '' }

export default { normalize, join, dirname, resolve, basename }
export { normalize, join, dirname, resolve, basename }
