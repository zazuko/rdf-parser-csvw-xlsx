import assert from 'assert'
import fs from 'fs'
import path from 'path'
import JsonLdParser from '@rdfjs/parser-jsonld'
import { describe, it } from 'mocha'
import rdf from '@zazuko/env'
import XlsxParser from '../index.js'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

function datasetFromJsonLdFs(filename) {
  const parser = new JsonLdParser()

  return rdf.dataset().import(parser.import(fs.createReadStream(filename), { factory: rdf }))
}

describe('rdf-parser-csvw-xlsx', () => {
  it('should be a constructor', () => {
    assert.strictEqual(typeof XlsxParser, 'function')
  })

  it('should parse the XLSX file using the given metadata', () => {
    return Promise.all([
      datasetFromJsonLdFs(path.join(__dirname, 'support/example.metadata.json')),
      datasetFromJsonLdFs(path.join(__dirname, 'support/example.sheet1.json')),
    ]).then(results => {
      const metadata = results[0]
      const expected = results[1]

      const input = fs.createReadStream(path.join(__dirname, 'support/example.xlsx'))
      const parser = new XlsxParser({ factory: rdf })
      const stream = parser.import(input, {
        baseIRI: 'http://example.org/base',
        metadata,
        sheet: 'sheet1',
      })

      return rdf.dataset().import(stream).then(dataset => {
        assert.strictEqual(dataset.toCanonical(), expected.toCanonical())
      })
    })
  })
})
