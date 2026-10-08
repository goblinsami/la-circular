import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { test } from 'node:test'
import { parse as parseSfc } from '@vue/compiler-sfc'
import { baseParse } from '@vue/compiler-dom'
import ts from 'typescript'
import { contentFields, contentKeys, defaultSiteContent } from '../types/content.ts'
import { validateContentInput } from '../utils/content-validation.ts'
import { formatSiteText } from '../utils/site-text.ts'

test('every default is valid, has a unique key and fits the request size limit', () => {
  assert.equal(new Set(contentKeys).size, contentKeys.length)
  assert.deepEqual(validateContentInput(defaultSiteContent), defaultSiteContent)
  const maximum = Object.fromEntries(contentFields.map(field => [field.key, '\u0001'.repeat(field.limit)]))
  assert.ok(Buffer.byteLength(JSON.stringify(maximum)) < 2 * 1024 * 1024)
})

test('dynamic labels substitute counts and names as literal text', () => {
  assert.equal(formatSiteText(defaultSiteContent.products_count_filtered_one, { count: 1, total: 12 }), '1 producte de 12')
  assert.equal(formatSiteText(defaultSiteContent.products_image_alt, { name: '<b>$&{count}</b>' }), 'Imatge de <b>$&{count}</b>')
  assert.equal(formatSiteText('{name} {unknown}', { name: 'Camamilla' }), 'Camamilla {unknown}')
})

test('all Vue text nodes and human-readable attributes come from editable data', () => {
  for (const directory of ['pages', 'components', 'layouts']) {
    for (const file of readdirSync(directory).filter(file => file.endsWith('.vue'))) {
      const path = `${directory}/${file}`
      const { descriptor } = parseSfc(readFileSync(path, 'utf8'))
      if (!descriptor.template) continue
      const walk = (node: any) => {
        if (node.type === 2) assert.equal(node.content.trim(), '', `${path}: static text ${node.content}`)
        if (node.type === 1) {
          for (const prop of node.props) {
            if (prop.type === 6 && ['aria-label', 'placeholder', 'title', 'alt'].includes(prop.name)) {
              assert.fail(`${path}: static ${prop.name}`)
            }
          }
        }
        if (node.type === 5) {
          const source = ts.createSourceFile(path, node.content.content, ts.ScriptTarget.Latest, true)
          const inspect = (part: ts.Node) => {
            if (ts.isStringLiteral(part) && part.text) {
              assert.ok(contentKeys.includes(part.text as typeof contentKeys[number]), `${path}: static expression ${part.text}`)
            }
            ts.forEachChild(part, inspect)
          }
          inspect(source)
        }
        for (const child of node.children ?? []) walk(child)
      }
      walk(baseParse(descriptor.template.content))
    }
  }
})

test('every static text lookup exists in the editor and Sheets inventory', () => {
  for (const directory of ['pages', 'components', 'layouts', 'composables']) {
    for (const file of readdirSync(directory).filter(file => /\.(vue|ts)$/.test(file))) {
      const path = `${directory}/${file}`
      const source = readFileSync(path, 'utf8')
      for (const match of source.matchAll(/\bt\(['"]([^'"]+)['"]/g)) {
        assert.ok(contentKeys.includes(match[1] as typeof contentKeys[number]), `${path}: unknown key ${match[1]}`)
      }
    }
  }
})
