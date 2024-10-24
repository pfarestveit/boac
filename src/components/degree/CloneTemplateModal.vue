<template>
  <v-dialog
    v-model="showModal"
    aria-labelledby="modal-header"
    persistent
  >
    <v-card class="modal-content" min-width="600">
      <FocusLock @keydown.esc="cancel">
        <v-card-title>
          <ModalHeader text="Name Your Degree Copy" />
        </v-card-title>
        <form @submit.prevent="createClone">
          <v-card-text class="modal-body">
            <label
              id="degree-name-input-label"
              for="degree-name-input"
            >
              Degree Name:
            </label>
            <v-text-field
              id="degree-name-input"
              v-model="name"
              aria-labelledby="degree-name-input-label"
              class="mt-2"
              color="primary"
              density="comfortable"
              :disabled="isSaving"
              hide-details
              maxlength="255"
              @keydoown.enter="() => name.length && createClone()"
              @keyup.esc="cancel"
            />
            <div class="ml-2">
              <span class="text-surface-variant font-size-12"><span class="sr-only">Degree name has a </span>255 character limit <span v-if="name.length">({{ 255 - name.length }} left)</span></span>
              <span
                v-if="name.length === 255"
                aria-live="polite"
                class="sr-only"
                role="alert"
              >
                Degree name cannot exceed 255 characters.
              </span>
            </div>
            <v-alert
              v-if="error"
              aria-live="polite"
              class="mt-2"
              density="compact"
              type="error"
              variant="tonal"
            >
              <span v-html="error"></span>
            </v-alert>
          </v-card-text>
          <v-card-actions class="modal-footer">
            <ProgressButton
              id="clone-confirm"
              :action="createClone"
              :disabled="!name.trim().length || isSaving || !!error || (templateToClone.name === name)"
              :in-progress="isSaving"
              :text="isSaving ? 'Saving' : 'Save Copy'"
            />
            <v-btn
              id="clone-cancel"
              class="ml-2"
              :disabled="isSaving"
              text="Cancel"
              variant="text"
              @click="cancel"
            />
          </v-card-actions>
        </form>
      </FocusLock>
    </v-card>
  </v-dialog>
</template>

<script setup>
import FocusLock from 'vue-focus-lock'
import ModalHeader from '@/components/util/ModalHeader'
import ProgressButton from '@/components/util/ProgressButton'
import {alertScreenReader, putFocusNextTick} from '@/lib/utils'
import {cloneDegreeTemplate, getDegreeTemplates} from '@/api/degree'
import {computed, onMounted, ref, watch} from 'vue'
import {map, trim} from 'lodash'

const props = defineProps({
  cancel: {
    required: true,
    type: Function
  },
  afterCreate: {
    required: true,
    type: Function
  },
  templateToClone: {
    required: true,
    type: Object
  }
})

const error = ref(undefined)
const isSaving = ref(false)
const name = ref(props.templateToClone.name)
const showModal = computed({
  get() {
    return !!props.templateToClone
  },
  set(value) {
    if (!value) {
      props.cancel()
    }
  }
})
watch(name, () => {
  error.value = null
})

onMounted(() => putFocusNextTick('degree-name-input'))

const createClone = () => {
  isSaving.value = true
  getDegreeTemplates().then(data => {
    const lower = trim(name.value).toLowerCase()
    if (map(data, 'name').findIndex(s => s.toLowerCase() === lower) === -1) {
      alertScreenReader('Cloning template')
      cloneDegreeTemplate(props.templateToClone.id, trim(name.value)).then(data => {
        props.afterCreate(data)
        isSaving.value = false
      })
    } else {
      error.value = `A degree named <span class="font-weight-500">'${name.value}'</span> already exists. Please choose a different name.`
      isSaving.value = false
    }
  })
}
</script>
