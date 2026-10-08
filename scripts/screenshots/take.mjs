// Usage: npm run build && node scripts/screenshots/take.mjs
// Writes website/images/*.png from the real UI filled with example data.
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { _electron as electron } from 'playwright'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const out = join(root, 'website', 'images')

async function shoot(theme, steps) {
  const app = await electron.launch({ args: [join(root, 'scripts', 'screenshots', 'main.cjs')], env: { ...process.env, SHOT_THEME: theme } })
  const page = await app.firstWindow()
  await page.setViewportSize({ width: 1100, height: 720 })
  await page.waitForSelector('.brand')
  if (theme === 'dark') await page.evaluate(() => (document.documentElement.dataset.theme = 'dark'))
  await steps(page)
  await app.close()
}

await shoot('light', async (page) => {
  await page.fill('input[type=text]', 'https://www.youtube.com/playlist?list=PLexample')
  await page.click('button[type=submit]')
  await page.waitForSelector('.playlist')
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(out, 'download-light.png') })
  await page.click('nav >> text=Queue')
  await page.waitForSelector('.jobs')
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(out, 'queue-light.png') })
})

await shoot('dark', async (page) => {
  await page.fill('input[type=text]', 'https://www.youtube.com/playlist?list=PLexample')
  await page.click('button[type=submit]')
  await page.waitForSelector('.playlist')
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(out, 'download-dark.png') })
})

console.log(`Screenshots written to ${out}`)
