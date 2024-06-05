import { Transform } from 'readable-stream'
import * as xlsx from 'xlsx'

export interface Options {
  sheet?: number | string
}

export default class XlsxToObjectTransform extends Transform {
  private readonly sheet: number | string
  private readonly buffers: Buffer[]

  constructor(options: Options = {}) {
    super({
      objectMode: true,
    })

    this.sheet = options.sheet || 0

    this.buffers = []
  }

  _transform(data: Buffer, encoding: unknown, done: () => void) {
    this.buffers.push(data)

    done()
  }

  _flush(done: () => void) {
    const data = Buffer.concat(this.buffers)
    const workbook = xlsx.read(data, { type: 'buffer' })
    const sheetName = typeof this.sheet === 'number' ? workbook.SheetNames[this.sheet] : this.sheet
    const sheet = workbook.Sheets[sheetName]

    xlsx.utils.sheet_to_json(sheet).forEach((row, index) => {
      this.push({
        line: index + 2,
        row,
      })
    })

    done()
  }
}
