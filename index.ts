import type { Readable } from 'stream'
import assign from 'lodash/assign.js'
import { Options as CsvwOptions } from '@zazuko/rdf-parser-csvw'
import ObjectParserTransform from '@zazuko/rdf-parser-csvw/lib/ObjectParserTransform.js'
import XlsxToObjectTransform, { Options as XlsxOptions } from './lib/XlsxToObjectTransform.js'

type Options = XlsxOptions & CsvwOptions

export default class Parser {
  private readonly options: Partial<Options> | undefined

  constructor(options?: Partial<Options>) {
    this.options = options
  }

  import(input: Readable, options?: Partial<Options>) {
    options = assign({}, this.options, options)

    const reader = new XlsxToObjectTransform(options)
    const output = new ObjectParserTransform(options)

    input.on('end', () => {
      if (!output.readable) {
        output.emit('end')
      }
    })

    input.on('error', err => {
      output.emit('error', err)
    })

    input.pipe(reader).pipe(output)

    return output
  }

  static import(input: Readable, options: Options) {
    return (new Parser(options)).import(input)
  }
}
