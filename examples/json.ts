import { createConsolji } from 'consolji'

const consolji = createConsolji({
   reporters: [
      {
         log: (logObj) => {
            console.log(JSON.stringify(logObj))
         },
      },
   ],
})

consolji.log('foo bar')
