<template>
  <div class="border-t-sm default-margins">
    <div class="ml-3 mt-4">
      <router-link
        v-if="degreeStore.parentTemplateUpdatedAt"
        id="degree-template-source"
        class="font-weight-medium"
        target="_blank"
        :to="`/degree/${degreeStore.parentTemplateId}`"
      >
        Created from template <span class="sr-only"> (will open new browser tab)</span>
        <v-icon :icon="mdiOpenInNew" size="14" />
      </router-link>
    </div>
    <div class="ml-3 mt-4">
      <div class="pb-1">
        <v-btn
          class="px-0 text-primary"
          :class="degreeStore.disableButtons ? 'text-primary' : 'text-medium-emphasis'"
          density="compact"
          :disabled="!degreeStore.disableButtons"
          flat
          :prepend-icon="mdiPlayCircleOutline"
          text="Force buttons to enable"
          variant="text"
          @click="() => degreeStore.setDisableButtons(false)"
        />
      </div>
      <div>
        <v-btn
          class="px-0 text-primary"
          :class="degreeStore.disableButtons ? 'text-primary' : 'text-medium-emphasis'"
          density="compact"
          flat
          :prepend-icon="mdiBug"
          :text="showDebug ? 'Hide debug' : 'Show debug'"
          variant="text"
          @click="() => showDebug = !showDebug"
        />
      </div>
      <v-expand-transition>
        <div v-if="showDebug" class="pa-3">
          <pre>{{ degreeStore.degreeEditSessionToString }}</pre>
        </div>
      </v-expand-transition>
    </div>
  </div>
</template>

<script setup>
import {mdiBug, mdiOpenInNew, mdiPlayCircleOutline} from '@mdi/js'
import {ref} from 'vue'
import {useDegreeStore} from '@/stores/degree-edit-session/index'

const degreeStore = useDegreeStore()
const showDebug = ref(false)
</script>
