export function shouldInjectProvider() {
  return doctypeCheck() && suffixCheck() && documentElementCheck()
}

function doctypeCheck() {
  const { doctype } = window.document
  return !doctype || doctype.name === 'html'
}

function suffixCheck() {
  const prohibited = [/\.xml$/u, /\.pdf$/u]
  return !prohibited.some(pattern => pattern.test(window.location.pathname))
}

function documentElementCheck() {
  return document.documentElement?.nodeName.toLowerCase() === 'html'
}
