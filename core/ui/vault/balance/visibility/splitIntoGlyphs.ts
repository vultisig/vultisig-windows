/** An element the balance swap animates on its own. */
export type Glyph = HTMLElement | SVGElement

type SplitIntoGlyphsResult = {
  content: DocumentFragment
  glyphs: Glyph[]
}

const createCharGlyph = (char: string) => {
  const glyph = document.createElement('span')
  glyph.style.display = 'inline-block'
  glyph.style.whiteSpace = 'pre'
  glyph.textContent = char

  return glyph
}

/**
 * Copies what `source` renders and breaks the copy into glyphs, in reading
 * order, so each can animate on its own. Text becomes one inline-block span
 * per character; an element with no text of its own, such as a hidden-balance
 * dot or an icon, is one glyph. The copy keeps the original's classes, so it
 * renders with the same typography, and `source` itself is left alone because
 * React owns it.
 */
export const splitIntoGlyphs = (source: Element): SplitIntoGlyphsResult => {
  const content = document.createDocumentFragment()
  source.childNodes.forEach(node => content.append(node.cloneNode(true)))

  content.querySelectorAll('[data-testid], [id]').forEach(element => {
    element.removeAttribute('data-testid')
    element.removeAttribute('id')
  })

  const glyphs: Glyph[] = []

  const visit = (node: Node) => {
    if (node instanceof Text) {
      const charGlyphs = Array.from(node.data, createCharGlyph)
      glyphs.push(...charGlyphs)
      node.replaceWith(...charGlyphs)
      return
    }

    if (node instanceof SVGElement) {
      glyphs.push(node)
      return
    }

    if (node instanceof HTMLElement) {
      if (node.hasChildNodes()) {
        Array.from(node.childNodes).forEach(visit)
      } else {
        glyphs.push(node)
      }
    }
  }

  Array.from(content.childNodes).forEach(visit)

  return { content, glyphs }
}
