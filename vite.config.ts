import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pxtoviewport from 'postcss-px-to-viewport'
import legacy from '@vitejs/plugin-legacy'
// https://vitejs.dev/config/
export default defineConfig({
  publicDir: '../',
  plugins: [react(),
    legacy({
      targets: ['defaults', 'ie >= 11', 'chrome 52'],  //需要兼容的目标列表，可以设置多个
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks:true,
      polyfills:[
        'es.symbol',
        'es.array.filter',
        'es.promise',
        'es.promise.finally',
        'es/map',
        'es/set',
        'es.array.for-each',
        'es.object.define-properties',
        'es.object.define-property',
        'es.object.get-own-property-descriptor',
        'es.object.get-own-property-descriptors',
        'es.object.keys',
        'es.object.to-string',
        'web.dom-collections.for-each',
        'esnext.global-this',
        'esnext.string.match-all'
      ]
    })],
  css: {
    postcss: {
      plugins:[
          pxtoviewport({
            unitToConvert: 'px', // 需要转换的单位，默认为"px"
            viewportWidth: 3750, // 设计稿的视口宽度
            unitPrecision: 5, // 单位转换后保留的精度
            propList: ['*'], // 能转化为vw的属性列表
            viewportUnit: 'rem', // 希望使用的视口单位
            exclude: [/node_modules/],
            fontViewportUnit: 'rem', // 字体使用的视口单位
            selectorBlackList: [], // 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
            minPixelValue: 1, // 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
            mediaQuery: false, // 媒体查询里的单位是否需要转换单位
            replace: true, //  是否直接更换属性值，而不添加备用属性
            include: undefined, // 如果设置了include，那将只有匹配到的文件才会被转换
            landscape: false, // 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
            landscapeUnit: 'rem', // 横屏时使用的单位
            landscapeWidth: 3750 // 横屏时使用的视口宽度
          })
      ]
    }
  },
  server: {
    open: true
  }
})
