<template>
  <v-fade-transition>
    <div class="d-flex flex-column vh-100">
      <a id="skip-to-content-link" href="#content" class="sr-only">Skip to main content</a>
      <a id="skip-to-nav-link" href="#nav-header" class="sr-only">Skip to navigation</a>
      <v-layout>
        <v-app-bar
          color="primary"
          elevation="0"
          role="banner"
          tag="banner"
          @shortkey="() => putFocusNextTick('search-students-input')"
        >
          <v-app-bar-nav-icon
            v-if="!$vuetify.display.mdAndUp"
            id="app-bar-nav-icon"
            aria-controls="small-viewport-sidebar"
            :aria-expanded="showSidebar"
            :aria-label="showSidebar ? 'Collapse navigation menu' : 'Expand navigation menu'"
            @click.stop="onToggleShowSidebar"
          />
          <AppBar />
        </v-app-bar>
        <v-navigation-drawer
          v-if="$vuetify.display.mdAndUp"
          aria-labelledby="nav-header"
          class="bg-tertiary pt-1 sidebar"
          permanent
          role="navigation"
          :scrim="false"
          tag="nav"
        >
          <template #append>
            <SidebarFooter v-if="currentUser.canAccessAdvisingData" />
          </template>
          <Sidebar />
        </v-navigation-drawer>
        <v-main role="none" tag="div">
          <div id="main-container" class="h-100" :class="{'align-center d-flex justify-center': loading}">
            <div v-if="loading" class="loading-container d-flex">
              <div class="my-auto" role="progressbar">
                <PlaneGoRound
                  id="spinner-when-loading"
                  aria-label="page loading"
                  role="progressbar"
                  tabindex="0"
                />
              </div>
            </div>
            <v-expand-transition>
              <div v-if="!$vuetify.display.mdAndUp && showSidebar && !loading">
                <Sidebar
                  id="small-viewport-sidebar"
                  class="bg-tertiary"
                  role="navigation"
                />
              </div>
            </v-expand-transition>
            <div
              v-show="!loading"
              class="w-100"
            >
              <ServiceAnnouncement />
              <div id="content" class="scroll-margins" role="main">
                <router-view :key="split($route.fullPath, '#', 1)[0]" />
              </div>
            </div>
          </div>
          <EditBatchNoteModal
            v-model="noteStore.isCreateNoteModalOpen"
            initial-mode="createBatch"
            :on-close="() => {
              noteStore.setMode(null)
              noteStore.setIsCreateNoteModalOpen(false)
              putFocusNextTick('batch-note-button')
            }"
            :toggle-show="show => isCreateNoteModalOpen = show"
          />
        </v-main>
      </v-layout>
      <footer
        class="pr-8"
        :class="`footer-${$vuetify.display.smAndDown ? 'sm' : ($vuetify.display.mdAndDown ? 'md' : ($vuetify.display.lgAndDown ? 'lg' : 'xl'))}`"
        role="footer"
      >
        <AppFooter v-if="!loading && !hideFooter" />
      </footer>
    </div>
  </v-fade-transition>
</template>

<script setup>
import AppBar from '@/layouts/shared/AppBar'
import AppFooter from '@/layouts/shared/AppFooter'
import EditBatchNoteModal from '@/components/note/EditBatchNoteModal'
import SidebarFooter from '@/components/sidebar/SidebarFooter.vue'
import PlaneGoRound from '@/layouts/shared/PlaneGoRound.vue'
import ServiceAnnouncement from '@/layouts/shared/ServiceAnnouncement'
import Sidebar from '@/components/sidebar/Sidebar'
import {putFocusNextTick, scrollTo} from '@/lib/utils'
import {computed, ref} from 'vue'
import {split} from 'lodash'
import {useContextStore} from '@/stores/context'
import {useNoteStore} from '@/stores/note-edit-session'

const contextStore = useContextStore()
const currentUser = contextStore.currentUser
const hideFooter = ref(false)
const loading = computed(() => contextStore.loading)
const noteStore = useNoteStore()
const showSidebar = ref(true)

contextStore.setEventHandler('hide-footer', value => hideFooter.value = value)

const onToggleShowSidebar = () => {
  showSidebar.value = !showSidebar.value
  if (showSidebar.value) {
    scrollTo('main-container', 'start')
  }
}
</script>

<style scoped>
.footer-sm {
  margin-left: auto;
  width: 100%;
}
.footer-md {
  margin-left: auto;
  width: 74%;
}
.footer-lg {
  margin-left: auto;
  width: 80%;
}
.footer-xl {
  margin-left: auto;
  width: 83%;
}
.loading-container {
  height: calc(100vh - 64px);
}
</style>

<style>
.sidebar .v-navigation-drawer__content {
  padding-bottom: 120px;
  scrollbar-width: none;
}
</style>
