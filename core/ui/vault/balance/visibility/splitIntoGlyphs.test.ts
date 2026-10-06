// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'

import { splitIntoGlyphs } from './splitIntoGlyphs'

const render = (html: string) => {
  const source = document.createElement('span')
  source.innerHTML = html
  return source
}

describe('splitIntoGlyphs', () => {
  it('splits text into one glyph per character, keeping its wrappers', () => {
    const source = render('<span class="tabular">$1,2</span>')

    const { content, glyphs } = splitIntoGlyphs(source)

    expect(glyphs.map(glyph => glyph.textContent)).toEqual(['$', '1', ',', '2'])
    const wrapper = content.querySelector('.tabular')
    expect(wrapper?.children).toHaveLength(4)
  })

  it('keeps spaces as glyphs so the copy lays out like the original', () => {
    const { glyphs } = splitIntoGlyphs(render('3 assets'))

    expect(glyphs).toHaveLength(8)
    expect(glyphs[1].textContent).toBe(' ')
    expect(glyphs[1].style.whiteSpace).toBe('pre')
  })

  it('treats an element without text, such as a hidden-balance dot, as one glyph', () => {
    const { glyphs } = splitIntoGlyphs(
      render('<span class="dots"><i></i><i></i><i></i></span>')
    )

    expect(glyphs.map(glyph => glyph.tagName)).toEqual(['I', 'I', 'I'])
  })

  it('never splits a character outside the basic plane in two', () => {
    const { glyphs } = splitIntoGlyphs(render('₩한𝟙'))

    expect(glyphs.map(glyph => glyph.textContent)).toEqual(['₩', '한', '𝟙'])
  })

  it('leaves the source alone and drops test ids from the copy', () => {
    const source = render('<span data-testid="balance" id="total">$5</span>')

    const { content } = splitIntoGlyphs(source)

    expect(source.innerHTML).toBe(
      '<span data-testid="balance" id="total">$5</span>'
    )
    expect(content.querySelector('[data-testid], [id]')).toBeNull()
  })
})
