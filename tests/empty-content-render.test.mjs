import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import { compile } from '@vue/compiler-dom'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'

async function render(file, texts = {}, extra = {}) {
  const { descriptor } = parse(readFileSync(file, 'utf8'))
  const { code } = compile(descriptor.template.content, { mode: 'function', prefixIdentifiers: true })
  const app = Vue.createSSRApp({
    render: new Function('Vue', code)(Vue),
    setup: () => ({
      t: key => texts[key] ?? '', displayedContent: texts,
      contentLoading: false, contentStatus: 'success', menuReady: true,
      menuOpen: false, ...extra,
    }),
  })
  app.component('NuxtLink', {
    props: ['to'],
    setup: (props, { slots }) => () => Vue.h('a', { href: props.to }, slots.default?.()),
  })
  app.component('ContentStatus', { render: () => null })
  app.component('ContentSectionLoader', { render: () => null })
  return renderToString(app)
}

test('empty home texts remove dots, arrows, numbers, cards and section borders', async () => {
  const html = await render('pages/index.vue', { home_text_2: '↗', home_text_3: '→', home_01: '01 /' })
  for (const orphan of ['small-dot', 'hero-actions', 'hero-art', 'values-section', 'card-number', '↗', '→', '01 /']) {
    assert.ok(!html.includes(orphan), orphan)
  }
})

test('home decorations remain when their associated text exists', async () => {
  const html = await render('pages/index.vue', {
    home_benestar_amb_proximitat: 'Proximitat',
    home_descobreix_els_productes: 'Productes', home_text_2: '↗',
    home_a_prop_teu_2: 'A prop teu', home_01: '01 /',
  })
  for (const visible of ['small-dot', 'Proximitat', '↗', 'card-number', 'A prop teu']) assert.ok(html.includes(visible))
})

test('empty project texts remove the note, its dot and the arrow link', async () => {
  const html = await render('pages/el-nostre-projecte.vue', { home_text_2: '↗' })
  for (const orphan of ['project-note', 'small-dot', '↗', 'class="prose"']) assert.ok(!html.includes(orphan), orphan)
})

test('project note never shows a standalone bullet when its text exists', async () => {
  for (const texts of [
    { project_petits_gestos_benestar_quotidia: 'Petits gestos.' },
    { project_ens_agrada_fer_les_coses_amb_calma: 'Amb cura i intencio.' },
    {
      project_petits_gestos_benestar_quotidia: 'Petits gestos.',
      project_ens_agrada_fer_les_coses_amb_calma: 'Amb cura i intencio.',
    },
  ]) {
    const html = await render('pages/el-nostre-projecte.vue', texts)
    assert.ok(html.includes('project-note'))
    assert.ok(!html.includes('small-dot'))
    for (const text of Object.values(texts)) assert.ok(html.includes(text))
  }
})

test('empty footer brand removes its punctuation', async () => {
  const html = await render('components/SiteFooter.vue', { footer_text: '.' })
  assert.ok(!html.includes('footer-brand'))
  assert.ok(!html.includes('aria-hidden'))
})

test('empty header texts remove the brand mark, menu icon and navigation items', async () => {
  const html = await render('components/SiteHeader.vue')
  for (const orphan of ['brand-mark', 'menu-icon', '<li', '<nav']) assert.ok(!html.includes(orphan), orphan)
})

test('empty status messages and retry labels leave no empty button or alert', async () => {
  for (const status of ['pending', 'error']) {
    const html = await render('components/ContentStatus.vue', {}, { status })
    assert.ok(!html.includes('<button'))
    assert.ok(!html.includes('content-status'))
  }
})
