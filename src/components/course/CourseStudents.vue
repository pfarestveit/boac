<template>
  <v-data-table
    id="course-students"
    :cell-props="data => {
      return {
        class: 'py-2 px-0 vertical-top',
        'data-label': data.column.title,
        id: `td-student-${data.item.uid}-column-${data.column.key}`,
        style: $vuetify.display.mdAndUp ? 'max-width: 200px;' : ''
      }
    }"
    class="responsive-data-table scroll-margins"
    density="compact"
    :headers="headers"
    hide-default-footer
    hover
    :items="section.students"
    :items-per-page="-1"
    mobile-breakpoint="md"
    must-sort
    :row-props="data => {
      const highlights = featured === data.item.uid ? 'list-group-item-info' : ''
      return {
        class: `border-b-sm border-t-sm ${highlights} hover-student-${data.item.uid}`,
        id: `tr-student-${data.item.uid}`
      }
    }"
  >
    <template #headers="{columns}">
      <tr>
        <th v-for="column in columns" :key="column.key" class="pb-2 pl-0 vertical-bottom">
          <span v-if="!['avatar', 'profile'].includes(column.key)" class="font-weight-bold">{{ column.title }}</span>
        </th>
      </tr>
    </template>
    <template #item.avatar="{item}">
      <div class="align-center d-flex">
        <div class="pl-3">
          <CuratedStudentCheckbox class="mb-8" domain="default" :student="item" />
        </div>
        <div class="student-avatar-container text-center">
          <StudentAvatar :key="item.sid" size="medium" :student="item" />
          <ManageStudent
            domain="default"
            :label-class="`font-size-14 font-weight-bold ${featured === item.uid ? 'text-tertiary' : ''}`"
            :sr-only="hoverUid !== item.uid"
            :student="item"
          />
        </div>
      </div>
    </template>
    <template #item.profile="{index, item}">
      <div>
        <router-link
          v-if="item.uid"
          :id="`link-to-student-${item.uid}`"
          :class="{'text-tertiary': featured === item.uid}"
          :to="studentRoutePath(item.uid, currentUser.inDemoMode)"
        >
          <h3
            :class="{'demo-mode-blur': currentUser.inDemoMode}"
            class="ma-0 pa-0 student-name"
          >
            <span v-if="item.firstName" v-html="lastNameFirst(item)"></span>
            <span v-if="!item.firstName" v-html="item.lastName"></span>
          </h3>
        </router-link>
        <span
          v-if="!item.uid"
          :id="`student-${item.sid}-has-no-uid`"
          class="font-size-16 ma-0 pa-0 "
          :class="{'demo-mode-blur': currentUser.inDemoMode}"
        >
          <span v-if="item.firstName" v-html="lastNameFirst(item)"></span>
          <span v-if="!item.firstName" v-html="item.lastName"></span>
        </span>
      </div>
      <div
        :id="`row-${index}-student-sid`"
        :class="{'demo-mode-blur': currentUser.inDemoMode}"
        class="align-center d-flex student-sid"
      >
        <div>
          {{ item.sid }}
        </div>
        <div
          v-if="get(item.enrollment, 'enrollmentStatus') === 'W'"
          :id="`student-${item.uid}-waitlisted-for-${section.termId}-${section.sectionId}`"
          class="font-weight-bold ml-1 text-error"
        >
          WAITLISTED
        </div>
        <div
          v-if="item.academicCareerStatus === 'Inactive'"
          :id="`student-${item.uid}-inactive-for-${section.termId}-${section.sectionId}`"
          class="font-weight-bold ml-1 text-error"
        >
          INACTIVE
        </div>
        <div
          v-if="item.academicCareerStatus === 'Completed'"
          class="ml-1"
        >
          <v-icon :icon="mdiSchool" />
          <v-tooltip activator="parent" location="bottom">
            Graduated
          </v-tooltip>
        </div>
      </div>
      <div
        v-if="displayAsAscInactive(item)"
        :id="`student-${item.uid}-asc-inactive-for-${section.termId}-${section.sectionId}`"
        class="font-weight-bold student-sid text-error"
      >
        ASC INACTIVE
      </div>
      <div
        v-if="displayAsCoeInactive(item)"
        :id="`student-${item.uid}-coe-inactive-for-${section.termId}-${section.sectionId}`"
        class="font-weight-bold student-sid text-error"
      >
        CoE INACTIVE
      </div>
      <div v-if="item.academicCareerStatus !== 'Completed'">
        <div :id="`student-${item.uid}-level`">
          <span class="font-size-13 text-medium-emphasis">{{ item.level }}</span>
        </div>
        <div :id="`student-${item.uid}-majors`">
          <div v-for="major in item.majors" :key="major" class="font-size-13 text-medium-emphasis">{{ major }}</div>
        </div>
      </div>
      <div v-if="item.academicCareerStatus === 'Completed'">
        <DegreesAwarded :student="item" />
        <div :id="`student-${item.uid}-graduated-colleges`">
          <div v-for="owner in degreePlanOwners(item)" :key="owner" class="font-size-13 text-medium-emphasis">
            {{ owner }}
          </div>
        </div>
      </div>
      <div>
        <div v-if="item.athleticsProfile" :id="`student-${item.uid}-teams`" class="student-teams-container">
          <div v-for="membership in item.athleticsProfile.athletics" :key="membership.groupName" class="font-size-13 text-medium-emphasis">
            {{ membership.groupName }}
            <span v-if="item.athleticsProfile.isActiveAsc === false"> (Inactive)</span>
          </div>
        </div>
      </div>
    </template>

    <template #item.courseSites="{item}">
      <div class="border-info border-s-md flex-col font-size-14 h-100">
        <div
          v-for="(canvasSite, index) in get(item.enrollment, 'canvasSites', [])"
          :key="index"
          class="font-weight-bold pl-2"
          :class="`height-when-canvas-site-count-${item.enrollment.canvasSites.length}`"
        >
          <div
            :class="{
              'demo-mode-blur': currentUser.inDemoMode,
              'pt-2': index > 0
            }"
          >
            {{ canvasSite.courseCode }}
          </div>
        </div>
        <div v-if="!size(get(item.enrollment, 'canvasSites'))" class="font-weight-bold pa-2">
          No course site
        </div>
      </div>
    </template>

    <template #item.assignmentsSubmitted="{item}">
      <div v-if="item.enrollment && item.enrollment.canvasSites.length" class="h-100 pl-2">
        <div
          v-for="(canvasSite, index) in item.enrollment.canvasSites"
          :key="index"
          :class="`height-when-canvas-site-count-${item.enrollment.canvasSites.length}`"
        >
          <div>
            <span v-if="item.enrollment.canvasSites.length > 1" class="sr-only">
              {{ canvasSite.courseCode }}
            </span>
            <div v-if="canvasSite.analytics.assignmentsSubmitted.boxPlottable" :class="{'pt-3': index, 'pt-1': !index}">
              <StudentBoxplot
                :chart-description="`Chart of ${item.firstName} ${item.lastName}'s assignments submitted in ${canvasSite.courseCode}`"
                :dataset="canvasSite.analytics.assignmentsSubmitted"
                :numeric-id="`${item.uid}-${canvasSite.canvasCourseId}-assignments`"
              />
            </div>
            <div v-if="canvasSite.analytics.assignmentsSubmitted.boxPlottable" class="sr-only">
              <div>User score: {{ canvasSite.analytics.assignmentsSubmitted.student.raw }}</div>
              <div>Maximum:  {{ canvasSite.analytics.assignmentsSubmitted.courseDeciles[10] }}</div>
              <div>70th Percentile: {{ canvasSite.analytics.assignmentsSubmitted.courseDeciles[7] }}</div>
              <div>50th Percentile: {{ canvasSite.analytics.assignmentsSubmitted.courseDeciles[5] }}</div>
              <div>30th Percentile: {{ canvasSite.analytics.assignmentsSubmitted.courseDeciles[3] }}</div>
              <div>Minimum: {{ canvasSite.analytics.assignmentsSubmitted.courseDeciles[0] }}</div>
            </div>
            <div
              v-if="!canvasSite.analytics.assignmentsSubmitted.boxPlottable"
              class="font-size-14 text-no-wrap"
              :class="{'pt-2': index}"
            >
              <div v-if="canvasSite.analytics.assignmentsSubmitted.courseDeciles">
                <strong>{{ canvasSite.analytics.assignmentsSubmitted.student.raw }}</strong>
                <span class="text-medium-emphasis">
                  (Max: {{ canvasSite.analytics.assignmentsSubmitted.courseDeciles[10] }})
                </span>
              </div>
              <div v-if="!canvasSite.analytics.assignmentsSubmitted.courseDeciles" class="font-italic">
                No Data
              </div>
            </div>
          </div>
        </div>
      </div>
      <span v-if="!item.enrollment || !item.enrollment.canvasSites.length"><span class="sr-only">No data</span>&mdash;</span>
    </template>

    <template #item.assignmentGrades="{item}">
      <div v-if="item.enrollment" class="h-100 pl-2">
        <div
          v-for="(canvasSite, index) in item.enrollment.canvasSites"
          :key="index"
          :class="`height-when-canvas-site-count-${item.enrollment.canvasSites.length}`"
        >
          <div>
            <span v-if="item.enrollment.canvasSites.length > 1" class="sr-only">
              {{ canvasSite.courseCode }}
            </span>
            <div v-if="canvasSite.analytics.currentScore.boxPlottable" :class="{'pt-3': index, 'pt-1': !index}">
              <StudentBoxplot
                :chart-description="`Chart of ${item.firstName} ${item.lastName}'s assignment grades in ${canvasSite.courseCode}`"
                :dataset="canvasSite.analytics.currentScore"
                :numeric-id="`${item.uid}-${canvasSite.canvasCourseId}`"
              />
            </div>
            <div v-if="canvasSite.analytics.currentScore.boxPlottable" class="sr-only">
              <div>User score: {{ canvasSite.analytics.currentScore.student.raw }}</div>
              <div>Maximum:  {{ canvasSite.analytics.currentScore.courseDeciles[10] }}</div>
              <div>70th Percentile: {{ canvasSite.analytics.currentScore.courseDeciles[7] }}</div>
              <div>50th Percentile: {{ canvasSite.analytics.currentScore.courseDeciles[5] }}</div>
              <div>30th Percentile: {{ canvasSite.analytics.currentScore.courseDeciles[3] }}</div>
              <div>Minimum: {{ canvasSite.analytics.currentScore.courseDeciles[0] }}</div>
            </div>
            <div
              v-if="!canvasSite.analytics.currentScore.boxPlottable"
              class="font-size-14"
              :class="{'pt-2': index > 0}"
            >
              <div v-if="canvasSite.analytics.currentScore.courseDeciles">
                Score: <strong>{{ canvasSite.analytics.currentScore.student.raw }}</strong>
                <div class="text-medium-emphasis">
                  (Max: {{ canvasSite.analytics.currentScore.courseDeciles[10] }})
                </div>
              </div>
              <div v-if="!canvasSite.analytics.currentScore.courseDeciles" class="font-italic">
                No Data
              </div>
            </div>
          </div>
        </div>
        <span v-if="!item.enrollment.canvasSites.length"><span class="sr-only">No data</span>&mdash;</span>
      </div>
      <span v-if="!item.enrollment">&mdash;</span>
    </template>

    <template #item.bCourses="{item}">
      <div v-if="item.enrollment" class="font-size-14 h-100 pl-2">
        <div
          v-for="(canvasSite, index) in item.enrollment.canvasSites"
          :key="canvasSite.canvasCourseId"
          :class="`height-when-canvas-site-count-${item.enrollment.canvasSites.length} ${index > 0 ? 'pt-2' : ''}`"
        >
          <span v-if="item.enrollment.canvasSites.length > 1" class="sr-only">
            {{ canvasSite.courseCode }}
          </span>
          {{ lastActivityDays(canvasSite.analytics) }}
        </div>
        <span v-if="!item.enrollment.canvasSites.length"><span class="sr-only">No data</span>&mdash;</span>
      </div>
      <span v-if="!item.enrollment">&mdash;</span>
    </template>

    <template #item.midtermGrade="{item}">
      <div v-if="item.enrollment" class="pl-1">
        <span v-if="item.enrollment.midtermGrade" v-accessible-grade="item.enrollment.midtermGrade" class="font-weight-bold font-size-14" />
        <v-icon
          v-if="isAlertGrade(item.enrollment.midtermGrade)"
          class="ml-1"
          color="warning"
          :icon="mdiAlert"
        />
        <span v-if="!item.enrollment.midtermGrade"><span class="sr-only">No data</span>&mdash;</span>
      </div>
      <div v-if="!item.enrollment" class="pl-1">&mdash;</div>
    </template>

    <template #item.finalGrade="{item}">
      <div v-if="item.enrollment" class="pl-1">
        <span v-if="item.enrollment.grade" v-accessible-grade="item.enrollment.grade" class="font-weight-bold font-size-14" />
        <v-icon
          v-if="isAlertGrade(item.enrollment.grade)"
          class="ml-1"
          color="warning"
          :icon="mdiAlert"
        />
        <span v-if="!item.enrollment.grade" class="cohort-grading-basis">
          {{ item.enrollment.gradingBasis }}
        </span>
      </div>
      <div v-if="!item.enrollment" class="pl-1">&mdash;</div>
    </template>
  </v-data-table>
</template>

<script setup>
import CuratedStudentCheckbox from '@/components/curated/dropdown/CuratedStudentCheckbox'
import DegreesAwarded from '@/components/student/DegreesAwarded'
import ManageStudent from '@/components/curated/dropdown/ManageStudent'
import StudentAvatar from '@/components/student/StudentAvatar'
import StudentBoxplot from '@/components/student/StudentBoxplot'
import {displayAsAscInactive, displayAsCoeInactive, isAlertGrade, lastActivityDays} from '@/berkeley'
import {each, get, map, size, split, uniq} from 'lodash'
import {lastNameFirst, studentRoutePath} from '@/lib/utils'
import {mdiAlert, mdiSchool} from '@mdi/js'
import {onBeforeMount, onMounted, ref} from 'vue'
import {useContextStore} from '@/stores/context'

const props = defineProps({
  featured: {
    default: undefined,
    required: false,
    type: String
  },
  section: {
    required: true,
    type: Object
  }
})

const contextStore = useContextStore()
const currentUser = contextStore.currentUser
const headers = ref([])
const hoverUid = ref(undefined)

onBeforeMount(() => {
  const rows = document.querySelectorAll('tr[id*=\'tr-student-\']')
  each(rows, row => row.removeEventListener('focusin', () => onFocus(row)))
  each(rows, row => row.removeEventListener('mouseover', () => onFocus(row)))
  each(rows, row => row.removeEventListener('blur', onBlur))
  each(rows, row => row.removeEventListener('mouseleave', onBlur))
})

onMounted(() => {
  const h = [
    {key: 'avatar', headerProps: {class: 'pb-2'}},
    {key: 'profile', headerProps: {class: 'pb-2'}},
    {key: 'courseSites', title: 'Course Site(s)', headerProps: {class: 'pb-2'}},
    {key: 'assignmentsSubmitted', title: 'Assignments Submitted', headerProps: {class: 'pb-2'}},
    {key: 'assignmentGrades', title: 'Assignment Grades', headerProps: {class: 'pb-2'}}
  ]
  if (contextStore.config.currentEnrollmentTermId === parseInt(props.section.termId)) {
    h.push({key: 'bCourses', title: 'bCourses Activity', headerProps: {class: 'pb-2'}})
  }
  headers.value = h.concat([
    {key: 'midtermGrade', title: 'Mid', headerProps: {class: 'pb-2'}},
    {key: 'finalGrade', title: 'Final', headerProps: {class: 'pb-2'}}
  ])
  const rows = document.querySelectorAll('tr[id*=\'tr-student-\']')
  each(rows, row => row.addEventListener('focusin', () => onFocus(row)))
  each(rows, row => row.addEventListener('mouseover', () => onFocus(row)))
  each(rows, row => row.addEventListener('blur', onBlur))
  each(rows, row => row.addEventListener('mouseleave', onBlur))
})

const degreePlanOwners = student => {
  const plans = get(student, 'degree.plans')
  return plans ? uniq(map(plans, 'group')) : []
}

const onBlur = () => {
  hoverUid.value = null
}

const onFocus = row => {
  hoverUid.value = split(row.id, '-').slice(-1)[0]
}
</script>

<style>
#course-students table {
  border-collapse: collapse;
}
</style>

<style scoped>
.height-when-canvas-site-count-1 {
  height: 100%;
}
.height-when-canvas-site-count-2 {
  min-height: 50%;
}
.height-when-canvas-site-count-3 {
  min-height: 33%;
}
.height-when-canvas-site-count-4 {
  min-height: 25%;
}
.height-when-canvas-site-count-5 {
  min-height: 20%;
}
.student-avatar-container {
  min-width: 136px;
}
.student-name {
  max-width: 190px;
}
</style>
