const lib = require('../dist/index.cjs')

module.exports = lib.consolji

for (const key in lib) {
   if (!(key in module.exports))
      module.exports[key] = lib[key]
}
