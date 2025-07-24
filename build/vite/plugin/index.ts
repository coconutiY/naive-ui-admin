import type {Plugin, PluginOption} from 'vite';
import Components from 'unplugin-vue-components/vite';
import {NaiveUiResolver} from 'unplugin-vue-components/resolvers';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

import {configHtmlPlugin} from './html';
import {configCompressPlugin} from './compress';

import Components from 'unplugin-vue-components/vite' // 按需加载自定义组件
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'


export function createVitePlugins(viteEnv: ViteEnv, isBuild: boolean) {
  const {VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE} = viteEnv;

  const vitePlugins: (Plugin | Plugin[] | PluginOption[])[] = [
    // have to
    vue(),
    // have to
    vueJsx(),

    // 按需引入NaiveUi且自动创建组件声明
    Components({
      dts: true,
      resolvers: [
        NaiveUiResolver(),
        ElementPlusResolver(),
        IconsResolver({
          enabledCollections: ['ep']
        })
      ],
    }),
    // Icons({
    //   autoInstall: true,
    //   compiler: 'vue3',
    // }),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'], //自动引入vue的ref、toRefs、onmounted等，无需在页面中再次引入
      resolvers: [ElementPlusResolver(), NaiveUiResolver(), IconsResolver({prefix: 'Icon'})],
      dts: 'auto-imports.d.ts'
    }),
  ];

  // vite-plugin-html
  vitePlugins.push(configHtmlPlugin(viteEnv, isBuild));

  if (isBuild) {
    // rollup-plugin-gzip
    vitePlugins.push(
      configCompressPlugin(VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE)
    );
  }

  return vitePlugins;
}
