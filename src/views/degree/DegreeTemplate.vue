<template>
  <div v-if="!loading" class="default-margins">
    <div class="border-b-sm">
      <h1 id="page-header" class="overflow-wrap-break-word">{{ degreeStore.degreeName || 'Degree Builder' }}</h1>
    </div>
    <div class="py-4 w-50">
      <h2 class="sr-only">Requirements</h2>
      <UnitRequirements />
    </div>
    <h2 class="sr-only">Categories</h2>
    <v-container class="mt-2 pa-0" fluid>
      <v-row>
        <v-col
          v-for="position in [1, 2, 3]"
          :id="`degree-template-column-${position}`"
          :key="position"
          class="degree-progress-column"
        >
          <TemplateCategoryColumn :position="position" />
        </v-col>
      </v-row>
    </v-container>
  </div>
  <div v-if="contextStore.config.isVueAppDebugMode">
    <DebugTemplate />
  </div>
</template>

<script setup>
import DebugTemplate from '@/components/degree/DebugTemplate'
import TemplateCategoryColumn from '@/components/degree/TemplateCategoryColumn'
import UnitRequirements from '@/components/degree/UnitRequirements'
import {putFocusNextTick, setPageTitle, toInt} from '@/lib/utils'
import {refreshDegreeTemplate} from '@/stores/degree-edit-session/utils'
import {useContextStore} from '@/stores/context'
import {computed, onMounted} from 'vue'
import {useDegreeStore} from '@/stores/degree-edit-session/index'
import {useRoute, useRouter} from 'vue-router'

const contextStore = useContextStore()
const degreeStore = useDegreeStore()
const router = useRouter()

const loading = computed(() => contextStore.loading)

contextStore.loadingStart()

onMounted(() => {
  const id = toInt(useRoute().params.id)
  refreshDegreeTemplate(id).then(() => {
    if (degreeStore.sid) {
      router.push(`/student/degree/${id}`)
    } else {
      setPageTitle(degreeStore.degreeName)
      contextStore.loadingComplete(degreeStore.templateId ? `Degree ${degreeStore.degreeName} has loaded` : 'Create degree page has loaded')
      putFocusNextTick('add-unit-requirement')
    }
  })
})
</script>

<style scoped>
.degree-progress-column {
  min-width: 300px;
  padding-bottom: 10px;
}
</style>
