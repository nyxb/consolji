import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
   rollup: {
      inlineDependencies: true,
   },
   hooks: {
      'rollup:options': function (_, options) {
         for (const output of options.output as any[])
            output.exports = 'named'
      },
   },
})
