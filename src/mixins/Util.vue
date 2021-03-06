<script>
import _ from 'lodash'
import numeral from 'numeral'

const decodeHtml = (snippet) => {
  if (snippet && snippet.indexOf('&') > 0) {
    const el = document.createElement('textarea')
    el.innerHTML = snippet
    return el.value
  } else {
    return snippet
  }
}

const toInt = (value, defaultValue = null) => {
  const parsed = parseInt(value, 10)
  return Number.isInteger(parsed) ? parsed : defaultValue
}

const toBoolean = value => value && value !== 'false'

export default {
  name: 'Util',
  methods: {
    escapeForRegExp: s => s && s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    lastNameFirst: u => u.lastName && u.firstName ? `${u.lastName}, ${u.firstName}` : (u.lastName || u.firstName),
    numFormat: (num, format=null) => numeral(num).format(format),
    oxfordJoin: arr => {
      switch(arr.length) {
      case 1: return _.head(arr)
      case 2: return `${_.head(arr)} and ${_.last(arr)}`
      default: return _.join(_.concat(_.initial(arr), ` and ${_.last(arr)}`), ', ')
      }
    },
    pluralize: (noun, count, substitutions = {}, pluralSuffix = 's') => {
      return (`${substitutions[count] || substitutions['other'] || count} ` + (count !== 1 ? `${noun}${pluralSuffix}` : noun))
    },
    putFocusNextTick(id, cssSelector = null) {
      this.$nextTick(() => {
        let counter = 0
        const putFocus = setInterval(() => {
          let el = document.getElementById(id)
          el = el && cssSelector ? el.querySelector(cssSelector) : el
          el && el.focus()
          if (el || ++counter > 5) {
            // Abort after success or three attempts
            clearInterval(putFocus)
          }
        }, 500)
      })
    },
    round: (value, decimals) => (Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)).toFixed(decimals),
    setPageTitle: phrase => (document.title = `${phrase ? decodeHtml(phrase) : 'UC Berkeley'} | BOA`),
    sortComparator: (a, b, nullFirst=true) => {
      if (_.isNil(a) || _.isNil(b)) {
        if (nullFirst) {
          return _.isNil(a) ? (_.isNil(b) ? 0 : -1) : 1
        } else {
          return _.isNil(b) ? (_.isNil(a) ? 0 : -1) : 1
        }
      } else if (_.isNumber(a) && _.isNumber(b)) {
        return a < b ? -1 : a > b ? 1 : 0
      } else {
        const aInt = toInt(a)
        const bInt = toInt(b)
        if (aInt && bInt) {
          return aInt < bInt ? -1 : aInt > bInt ? 1 : 0
        } else {
          return a.toString().localeCompare(b.toString(), undefined, {
            numeric: true
          })
        }
      }
    },
    stripAnchorRef: fullPath => _.split(fullPath, '#', 1)[0],
    stripHtmlAndTrim: html => {
      let text = html && html.replace(/<([^>]+)>/ig,'')
      text = text && text.replace(/&nbsp;/g, '')
      return _.trim(text)
    },
    studentRoutePath: (uid, inDemoMode) => inDemoMode ? `/student/${window.btoa(uid)}` : `/student/${uid}`,
    toBoolean,
    toInt
  }
}
</script>
