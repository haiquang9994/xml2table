const express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  port = process.env.PORT || 5172,
  fileUpload = require('express-fileupload'),
  parser = require('fast-xml-parser'),
  pretty = require('pretty')

app.use(fileUpload())

const getheads = (data) => {
  let heads = []
  data.forEach(item => {
    for (var key in item) {
      let value = item[key]
      if (typeof value === 'string' || typeof value === 'number') {
        if (heads.indexOf(key) === -1) {
          heads.push(key)
        }
      }
    }
  })
  return heads
}

const renderthead = (heads) => {
  return '<tr><th>' + heads.join('</th><th>') + '</th></tr>'
}
const rendertbody = (heads) => {
  return '<tr><td>' + heads.join('</td><td>') + '</td></tr>'
}

const data2table = (data) => {
  let all = ''
  if (data instanceof Array) {
    const heads = getheads(data)
    let tmp = '<table><thead>' + renderthead(heads) + '</thead>'
    tmp += '<tbody>'
    data.forEach((item) => {
      let a = []
      heads.forEach(k => {
        a.push(item[k] || '')
      })
      tmp += rendertbody(a)
    })
    tmp += '</tbody>'
    tmp += '</table>'
    all += tmp
  } else if (data instanceof Object) {
    let heads = []
    let values = []
    let arr = []
    for (var key in data) {
      let value = data[key]
      if (typeof value === 'string' || typeof value === 'number') {
        heads.push(key)
        values.push(value)
      } else {
        arr.push(data[key])
      }
    }
    if (heads.length > 0) {
      let tmp = '<table><thead>'
      tmp += renderthead(heads)
      tmp += '</thead>'
      tmp += '<tbody>'
      tmp += rendertbody(values)
      tmp += '</tbody>'
      tmp += '</table>'
      all += tmp
    }
    arr.forEach(ai => {
      all += data2table(ai)
    })
  }
  return all
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html')
})
app.post('/run', function (req, res) {
  let content = req.files.file.data.toString()
  let json = parser.parse(content)
  let html = ''
  html += '<html>'
  html += '<body>'
  html += data2table(json)
  html += '</body>'
  html += '</html>'
  res.write(pretty(html))
  res.end()
})

server.listen(port, function () {
  console.log('Server: http://127.0.0.1:' + port)
})

// test new line in github.dev
