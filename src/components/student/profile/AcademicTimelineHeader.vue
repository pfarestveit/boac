<template>
  <div class="align-start d-flex flex-wrap justify-space-between pb-1 w-100">
    <div>
      <h2 id="student-academic-timeline-header" class="font-size-24 font-weight-bold py-0">Academic Timeline</h2>
    </div>
    <div v-if="!currentUser.isAdmin && currentUser.canAccessAdvisingData" class="mt-1">
      <v-btn
        id="new-note-button"
        class="border-e-sm"
        color="primary"
        :disabled="!!noteStore.mode"
        :prepend-icon="mdiFileDocument"
        text="New Note"
        @click="() => isEditingNote = true"
      />
      <EditBatchNoteModal
        v-model="isEditingNote"
        initial-mode="createNote"
        :on-close="onModalClose"
        :sid="student.sid"
      />
    </div>
  </div>
  <div class="border-b-sm">
    <v-tabs
      v-model="selectedTab"
      aria-label="timeline messages tab"
      :aria-orientation="$vuetify.display.mdAndUp ? 'horizontal' : 'vertical'"
      class="mt-2"
      :class="{'horizontal-tabs': $vuetify.display.mdAndUp}"
      color="primary"
      density="compact"
      :direction="$vuetify.display.mdAndUp ? 'horizontal' : 'vertical'"
      selected-class="bg-sky-blue font-weight-bold"
      @update:model-value="onUpdateTabsModel"
    >
      <v-tab
        id="timeline-tab-all"
        aria-controls="timeline-messages"
        class="border-s-sm border-t-sm"
        value="all"
        variant="tonal"
      >
        <span class="sr-only">Show </span>All
      </v-tab>
      <v-tab
        v-for="type in keys(filterTypes)"
        :id="`timeline-tab-${type}`"
        :key="type"
        :disabled="!countsPerType[type]"
        :value="type"
        variant="tonal"
      >
        <span class="sr-only">Show </span>{{ filterTypes[type].tab }}
      </v-tab>
    </v-tabs>
  </div>
</template>

<script setup>
import EditBatchNoteModal from '@/components/note/EditBatchNoteModal'
import {includes, keys} from 'lodash'
import {mdiFileDocument} from '@mdi/js'
import {putFocusNextTick} from '@/lib/utils'
import {ref} from 'vue'
import {useContextStore} from '@/stores/context'
import {useNoteStore} from '@/stores/note-edit-session'

const props = defineProps({
  countsPerType: {
    required: true,
    type: Object
  },
  filter: {
    default: undefined,
    required: false,
    type: String
  },
  filterTypes: {
    required: true,
    type: Object
  },
  setFilter: {
    required: true,
    type: Function
  },
  student: {
    required: true,
    type: Object
  }
})

const contextStore = useContextStore()
const noteStore = useNoteStore()

const currentUser = contextStore.currentUser
const isEditingNote = ref(false)
const selectedTab = ref(undefined)

const onModalClose = note => {
  isEditingNote.value = false
  putFocusNextTick(note && includes(['all', 'note'], selectedTab) ? `timeline-tab-${selectedTab.value}-message-0` : 'new-note-button')
}

const onUpdateTabsModel = value => props.setFilter(value === 'all' ? null : value)
</script>

<style scoped>
.horizontal-tabs {
  min-width: 680px;
}
</style>
