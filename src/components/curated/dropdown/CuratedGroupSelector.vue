<template>
  <div class="d-flex align-end">
    <label id="add-all-checkbox-label" :for="checkboxId" class="sr-only">
      Select all students to add to a {{ domainLabel(false) }}
    </label>
    <div class="checkbox-container" :class="{'checked-checkbox-container': size(sids)}">
      <input
        :id="checkboxId"
        v-model="isSelectAllChecked"
        :aria-controls="dropdownId"
        class="checkbox"
        :disabled="isSaving"
        :indeterminate="indeterminate"
        type="checkbox"
        @update:model-value="toggle"
      />
    </div>
    <v-menu
      v-if="!!size(sids)"
      :id="dropdownId"
      :close-on-content-click="false"
      :disabled="isConfirming || isSaving"
    >
      <template #activator="{props: menuProps}">
        <v-btn
          :id="isSaving ? `add-to-${idFragment}-confirmation` : `add-to-${idFragment}`"
          :color="isConfirming ? 'success' : 'primary'"
          slim
          variant="flat"
          v-bind="menuProps"
        >
          <div class="align-center d-flex">
            <v-progress-circular
              v-if="isSaving && !isConfirming"
              indeterminate
              size="14"
              width="2"
            />
            <div v-if="!isConfirming" class="ml-1">
              {{ isSaving ? 'Adding' : 'Add' }} to {{ domainLabel(true) }}
            </div>
            <v-icon v-if="!isSaving && !isConfirming" :icon="mdiMenuDown" />
            <div v-if="isConfirming" class="align-center d-flex">
              <v-icon class="mr-1" :icon="mdiCheckBold" size="14" /><span>Added to {{ domainLabel(true) }}</span>
            </div>
          </div>
        </v-btn>
      </template>
      <v-list class="overflow-x-hidden" density="compact" variant="flat">
        <v-list-item v-if="!size(myCuratedGroups)" disabled>
          <span class="px-3 py-1 text-no-wrap">You have no {{ domainLabel(false) }}s.</span>
        </v-list-item>
        <v-list-item
          v-for="group in myCuratedGroups"
          :key="group.id"
          class="v-list-item-override py-0"
          density="compact"
          @click.stop="onClickCuratedGroup(group)"
          @keyup.enter="onClickCuratedGroup(group)"
        >
          <template #prepend>
            <v-checkbox
              :id="`${idFragment}-${group.id}-checkbox`"
              :model-value="!!find(selectedCuratedGroups, {'id': group.id})"
              class="mr-7 w-100"
              color="primary"
              density="compact"
              hide-details
            >
              <template #label>
                <span class="truncate-with-ellipsis ml-2">
                  {{ group.name }}
                </span>
              </template>
            </v-checkbox>
          </template>
        </v-list-item>
        <v-list-item>
          <v-btn
            :id="`submit-${idFragment}`"
            :aria-label="`Add students to selected ${domainLabel(true)}s`"
            class="px-6"
            color="primary"
            :disabled="!size(selectedCuratedGroups) || isConfirming || isSaving"
            height="32"
            text="Add"
            @click="onSubmit"
          />
        </v-list-item>
        <v-list-item class="border-t-sm mt-2 pt-2" density="compact">
          <v-btn
            :id="`create-${idFragment}`"
            :aria-label="`Create a new ${domainLabel(false)}`"
            color="primary"
            :prepend-icon="mdiPlus"
            :text="`Create New ${domainLabel(true)}`"
            variant="text"
            @click.stop="showModal = true"
          />
        </v-list-item>
      </v-list>
    </v-menu>
    <CreateCuratedGroupModal
      :cancel="modalCancel"
      :create="modalCreateCuratedGroup"
      :domain="domain"
      :show-modal="showModal"
    />
  </div>
</template>

<script setup>
import CreateCuratedGroupModal from '@/components/curated/CreateCuratedGroupModal'
import {addStudentsToCuratedGroups, createCuratedGroup} from '@/api/curated'
import {alertScreenReader, oxfordJoin, pluralize} from '@/lib/utils'
import {computed, onMounted, onUnmounted, reactive, ref} from 'vue'
import {describeCuratedGroupDomain} from '@/berkeley'
import {each, filter as _filter, find, inRange, map, remove, size} from 'lodash'
import {mdiCheckBold, mdiMenuDown, mdiPlus} from '@mdi/js'
import {putFocusNextTick} from '@/lib/utils'
import {useContextStore} from '@/stores/context'

const props = defineProps({
  contextDescription: {
    required: true,
    type: String
  },
  domain: {
    required: true,
    type: String
  },
  onCreateCuratedGroup: {
    default: () => {},
    required: false,
    type: Function
  },
  students: {
    required: true,
    type: Array
  }
})

const contextStore = useContextStore()

const idFragment = describeCuratedGroupDomain(props.domain, false).replace(' ', '-')
const checkboxId = `add-all-to-${idFragment}`
const currentUser = reactive(contextStore.currentUser)
const dropdownId = `${idFragment}-dropdown-select`
const indeterminate = ref(false)
const isConfirming = ref(false)
const isSaving = ref(false)
const isSelectAllChecked = ref(false)
const selectedCuratedGroups = ref([])
const showModal = ref(false)
const sids = ref([])

const myCuratedGroups = computed(() => {
  return _filter(currentUser.myCuratedGroups, ['domain', props.domain])
})

onMounted(() => {
  contextStore.setEventHandler('curated-group-checkbox-checked', onCheckboxChecked)
  contextStore.setEventHandler('curated-group-checkbox-unchecked', onCheckboxUnchecked)
})

onUnmounted(() => {
  contextStore.removeEventHandler('curated-group-checkbox-checked', onCheckboxChecked)
  contextStore.removeEventHandler('curated-group-checkbox-unchecked', onCheckboxUnchecked)
})

const afterCreateGroup = () => {
  sids.value = []
  refresh()
  toggle(false)
  putFocusNextTick(checkboxId)
  props.onCreateCuratedGroup()
}

const domainLabel = capitalize => {
  return describeCuratedGroupDomain(props.domain, capitalize)
}

const modalCancel = () => {
  showModal.value = false
  alertScreenReader('Canceled')
}

const modalCreateCuratedGroup = name => {
  isSaving.value = true
  return createCuratedGroup(props.domain, name, sids.value).then(() => {
    showModal.value = false
    isSaving.value = false
    isConfirming.value = true
    alertScreenReader(`${pluralize('student', size(sids.value))} added to ${domainLabel(false)} ${name}`)
  }).finally(() => {
    setTimeout(
      () => {
        afterCreateGroup()
        isConfirming.value = false
      },
      2000
    )
  })
}

const onCheckboxChecked = args => {
  if (props.domain === args.domain) {
    sids.value.push(args.sid)
    refresh()
  }
}

const onCheckboxUnchecked = args => {
  if (props.domain === args.domain) {
    sids.value = remove(sids.value, s => s !== args.sid)
    refresh()
  }
}

const onClickCuratedGroup = group => {
  const selected = selectedCuratedGroups.value.findIndex(g => g.id === group.id)
  if (selected >= 0) {
    selectedCuratedGroups.value.splice(selected, 1)
  } else {
    selectedCuratedGroups.value.push(group)
  }
}

const onSubmit = () => {
  isSaving.value = true
  const groupCount = size(selectedCuratedGroups.value)
  const groupDescription = groupCount > 1 ? pluralize(domainLabel(false), groupCount) : domainLabel(false)
  const groupIds = map(selectedCuratedGroups.value, 'id')
  const groupNames = oxfordJoin(map(selectedCuratedGroups.value, 'name'))
  alertScreenReader(`Adding students to ${groupDescription}`)
  addStudentsToCuratedGroups(groupIds, sids.value).then(() => {
    isSaving.value = false
    isConfirming.value = true
  }).finally(() => {
    setTimeout(
      () => {
        isConfirming.value = false
        isSelectAllChecked.value = indeterminate.value = false
        selectedCuratedGroups.value = []
        contextStore.broadcast('curated-group-deselect-all', props.domain)
        alertScreenReader(`${pluralize('student', size(sids.value))} added to ${groupDescription} ${groupNames}.`)
        sids.value = []
        putFocusNextTick(checkboxId)
      },
      2000
    )
  })
}

const refresh = () => {
  indeterminate.value = inRange(size(sids.value), 1, size(props.students))
  isSelectAllChecked.value = size(sids.value) === size(props.students)
}

const toggle = checked => {
  sids.value = []
  if (checked) {
    each(props.students, student => {
      sids.value.push(student.sid || student.csEmplId)
    })
    contextStore.broadcast('curated-group-select-all', props.domain)
    putFocusNextTick(dropdownId, {cssSelector: 'button'})
    alertScreenReader('All students on this page selected.')
  } else {
    contextStore.broadcast('curated-group-deselect-all', props.domain)
    alertScreenReader('All students on this page deselected.')
  }
}
</script>
