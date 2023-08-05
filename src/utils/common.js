define([], function() {
  return {
    // 深度克隆
    deepClone(source) {
      if (!source && typeof source !== 'object') {
          throw new Error('error arguments', 'shallowClone')
      }
      const targetObj = source.constructor === Array ? [] : {}
      Object.keys(source).forEach(keys => {
          if (source[keys] && typeof source[keys] === 'object') {
              targetObj[keys] = this.deepClone(source[keys])
          } else {
              targetObj[keys] = source[keys]
          }
      })
      return targetObj
    }
  }  
});