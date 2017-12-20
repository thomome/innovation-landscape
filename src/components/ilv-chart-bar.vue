<template>
  <path :d="path"></path>
</template>

<script>
  export default {
    props: ['from', 'to', 'amount'],
    data () {
      return {

      }
    },
    computed: {
      path() {
        const from = parseInt(this.from)
        const to = parseInt(this.to)
        const amount = parseInt(this.amount)
        const w = to-from
        const x = from+(w*0.5)
        const h = amount
        const o = 200
        const y = 500

        const r = -0.861*(((h*o*0.5)/(h*w*0.5))-1)-0.3088*Math.pow(((h*o*0.5)/(h*w*0.5))-1, 3)

        console.log(x,y,w,h,o,r)

        let points = ''
        points += `M${ (x+w*0.5) },${ y } `
        points += `C${ r >= 0 ? (x+w*(1-r)*0.5) : (x+w*0.5) },${ r >= 0 ? y : (y+(r)*h) } `
        points += `${ r >= 0 ? x : (x-(r)*w*0.5) },${ r >= 0 ? (y-h*(1-r)) : (y-h) } `
        points += `${ x },${ (y-h) } `
        points += `C${ r >= 0 ? x : (x+(r)*w*0.5) },${ r >= 0 ? (y-h*(1-r)) : (y-h) } `
        points += `${ r >= 0 ? (x-w*(1-r)*0.5) : (x-w*0.5) },${ r >= 0 ? y : (y+(r)*h) } `
        points += `${ (x-w*0.5) },${ y }Z`

        return points
      }
    }
  }
</script>
