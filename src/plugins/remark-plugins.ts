import type { Node, Root } from 'mdast'
import type { Plugin } from 'unified'
import getReadingTime from 'reading-time'
import { toString } from 'mdast-util-to-string'
import { visit } from 'unist-util-visit'

export const remarkAddZoomable: Plugin<[{ className?: string }], Root> =
  ({ className = 'zoomable' }) =>
  (tree) => {
    visit(tree, 'image', (node: Node) => {
      node.data = { hProperties: { class: className } }
    })
  }

export const remarkReadingTime: Plugin<[], Root> =
  () =>
  (tree, { data }) => {
    const textOnPage = toString(tree)
    const readingTime = getReadingTime(textOnPage)
    // readingTime.text will give us minutes read as a friendly string,
    // i.e. "3 min"
    if (data.astro?.frontmatter) {
      data.astro.frontmatter.minutesRead = readingTime.text
      data.astro.frontmatter.words = readingTime.words
    }
  }
