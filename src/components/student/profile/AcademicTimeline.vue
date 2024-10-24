<template>
  <div v-if="!isTimelineLoading" aria-labelledby="student-academic-timeline-header" role="region">
    <AcademicTimelineHeader
      :counts-per-type="countsPerType"
      :filter="selectedFilter"
      :filter-types="filterTypes"
      :set-filter="setFilter"
      :student="student"
    />
    <div class="pt-3">
      <AcademicTimelineTable
        :count-per-active-tab="selectedFilter ? countsPerType[selectedFilter] : size(messages)"
        :selected-filter="selectedFilter"
        :filter-types="filterTypes"
        :messages="messages"
        :on-create-new-note="onCreateNewNote"
        :student="student"
      />
    </div>
  </div>
</template>

<script setup>
import AcademicTimelineHeader from '@/components/student/profile/AcademicTimelineHeader'
import AcademicTimelineTable from '@/components/student/profile/AcademicTimelineTable'
import {get, each, findIndex, keys, remove, size, find} from 'lodash'
import {getNote} from '@/api/notes'
import {DateTime} from 'luxon'
import {onUnmounted, reactive, ref} from 'vue'
import {useContextStore} from '@/stores/context'

const props = defineProps({
  student: {
    required: true,
    type: Object
  }
})

const countsPerType = ref({})
const currentUser = reactive(useContextStore().currentUser)
const eventHandlers = ref(undefined)
const filterTypes = ref(undefined)
const isTimelineLoading = ref(true)
const messages = ref(undefined)
const selectedFilter = ref(undefined)

const init = () => {
  messages.value = []
  filterTypes.value = {
    alert: {name: 'Alert', tab: 'Alerts', tabWidth: 65},
    hold: {name: 'Hold', tab: 'Holds', tabWidth: 62},
    requirement: {name: 'Requirement', tab: 'Reqs', tabWidth: 58}
  }
  if (currentUser.canAccessAdvisingData) {
    filterTypes.value.eForm = {name: 'eForm', tab: 'eForms', tabWidth: 76}
    filterTypes.value.note = {name: 'Advising Note', tab: 'Notes', tabWidth: 64}
    filterTypes.value.appointment = {name: 'Appointment', tab: 'Appointments', tabWidth: 126}
  }
  each(keys(filterTypes.value), (type, typeIndex) => {
    let notifications = props.student.notifications[type]
    countsPerType.value[type] = size(notifications)
    each(notifications, (message, index) => {
      // If object is not a BOA advising note then generate a transient and non-zero primary key.
      message.transientId = (typeIndex + 1) * 1000 + index
      if (!message.id) {
        message.id = message.transientId
      }
      messages.value.push(message)
    })
  })
  sortMessages()
  isTimelineLoading.value = false
  eventHandlers.value = {
    'note-deleted': onDeleteNoteEvent,
    'note-updated': onNoteUpdated,
    'notes-batch-published': onPublishBatchNotes
  }
  each(eventHandlers.value, (handler, eventType) => {
    useContextStore().setEventHandler(eventType, handler)
  })
}

const onCreateNewNote = note => {
  if (note.sid === props.student.sid) {
    const message = find(messages.value, ['id', note.id])
    note.transientId = message ? message.transientId : note.id
    if (message) {
      const existingNoteIndex = findIndex(messages.value, {'id': note.id})
      messages.value.splice(existingNoteIndex, 1, note)
    } else {
      messages.value.push(note)
      updateCountsPerType('note', countsPerType.value.note + 1)
    }
    sortMessages()
  }
}

const onDeleteNoteEvent = noteId => {
  const removed = remove(messages.value, m => m.type === 'note' && m.id === noteId)
  if (removed) {
    updateCountsPerType('note', countsPerType.value.note - 1)
    sortMessages()
  }
}

const onNoteUpdated = note => {
  if (note.sid === props.student.sid) {
    getNote(note.id).then(note => {
      onCreateNewNote(note)
    })
  }
}

const onPublishBatchNotes = noteIdsBySid => {
  const noteId = get(noteIdsBySid, props.student.sid)
  if (noteId) {
    getNote(noteId).then(note => {
      onCreateNewNote(note)
    })
  }
}

const setFilter = filter => {
  if (selectedFilter.value !== filter) {
    selectedFilter.value = filter
  }
}

const sortDate = message => {
  let date
  if (message.type === 'appointment' || message.type === 'note') {
    date = message.setDate || message.createdAt
  } else {
    date = message.updatedAt || message.createdAt
  }
  return date ? DateTime.fromISO(date).setZone(useContextStore().config.timezone).toString() : date
}

const sortMessages = () => {
  messages.value.sort((m1, m2) => {
    let d1 = sortDate(m1)
    let d2 = sortDate(m2)
    if (d1 && d2 && d1 !== d2) {
      return d2.localeCompare(d1)
    } else if (d1 === d2 && m1.id && m2.id) {
      return m2.id < m1.id ? -1 : 1
    } else if (!d1 && !d2) {
      return m2.transientId - m1.transientId
    } else {
      return d1 ? -1 : 1
    }
  })
}

const updateCountsPerType = (type, count) => {
  countsPerType.value[type] = count
}

onUnmounted(() => {
  each(eventHandlers.value || {}, (handler, eventType) => {
    useContextStore().removeEventHandler(eventType, handler)
  })
})

init()

</script>
