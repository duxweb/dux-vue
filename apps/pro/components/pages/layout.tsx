import { DuxTabRouterView, useI18n, useTheme } from '@duxweb/dvha-core'
import { OverlaysProvider } from '@overlastic/vue'
import { darkTheme, enUS, lightTheme, NConfigProvider, NMessageProvider, NNotificationProvider, zhCN } from 'naive-ui'
import { computed, defineComponent, onBeforeMount } from 'vue'
import { useUI } from '../../hooks/ui'
import { themeOverrides } from '../../theme'
import { DuxMenuCmd, DuxMenuMain } from './menu'
import { DuxMobileMenu } from './mobile'

export default defineComponent({
  name: 'DuxLayout',
  setup() {
    const { menuCollapsed } = useUI()
    const { isDark, cssInit } = useTheme()

    const { lightTheme: lightThemeOverrides, darkTheme: darkThemeOverrides } = themeOverrides()

    onBeforeMount(() => {
      cssInit()
    })

    const { getLocale } = useI18n()

    const locale = computed(() => {
      const lang = getLocale()
      if (lang === 'zh-CN') {
        return zhCN
      }
      return enUS
    })

    return () => (
      <NConfigProvider locale={locale.value} theme={isDark ? darkTheme : lightTheme} themeOverrides={isDark ? darkThemeOverrides.value : lightThemeOverrides.value}>
        <NNotificationProvider>
          <NMessageProvider>
            <OverlaysProvider>
              {/* <div class="dynamic-background fixed inset-0 pointer-events-none">
              </div> */}

              <div class="h-screen w-screen flex relative z-10 ">
                <div class={[
                  'flex-none transition-all',
                  'hidden lg:block app-menu border-r border-muted',
                  menuCollapsed.value ? 'w-60px' : 'w-200px',
                ]}
                >
                  <DuxMenuMain />
                </div>

                <DuxTabRouterView />
              </div>
              <DuxMenuCmd />

              <DuxMobileMenu />
            </OverlaysProvider>
          </NMessageProvider>
        </NNotificationProvider>
      </NConfigProvider>
    )
  },
})
