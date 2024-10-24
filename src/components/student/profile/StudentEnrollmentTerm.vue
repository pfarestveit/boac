<template>
  <div
    class="d-flex flex-column h-100 student-term"
    :class="{'bg-pale-yellow elevation-1 pt-3 px-3 rounded-0': isCurrentTerm}"
  >
    <div>
      <div class="pa-0">
        <div class="align-baseline d-flex font-weight-500">
          <h3
            :id="`term-${term.termId}-header`"
            class="font-size-18 font-weight-500 text-surface-variant mb-0 mr-2"
          >
            {{ term.termName }}
          </h3>
          <span v-if="isConcurrent" class="font-size-14 text-medium-emphasis ml-1 mr-3">UCBX</span>
          <StudentAcademicStanding
            v-if="term.academicStanding"
            class="font-size-14"
            id-prefix="classes"
            :standing="term.academicStanding"
          />
          <StudentWithdrawalCancel
            v-if="student.sisProfile.withdrawalCancel"
            class="font-size-14"
            :term-id="term.termId"
            :withdrawal="student.sisProfile.withdrawalCancel"
          />
        </div>
      </div>
    </div>
    <div class="pt-2 px-0">
      <div role="table">
        <div role="rowgroup">
          <div role="row" class="align-center border-b-sm d-flex font-size-12 font-weight-bold mx-1 text-medium-emphasis text-nowrap text-uppercase">
            <div role="columnheader" class="student-course-column-name">Course</div>
            <div role="columnheader" class="student-course-column-grade">Mid</div>
            <div role="columnheader" class="student-course-column-grade">Final</div>
            <div role="columnheader" class="student-course-column-units">Units</div>
          </div>
        </div>
        <div role="rowgroup" class="pt-2">
          <div v-if="isEmpty(term.enrollments)" role="row">
            <div
              :id="`term-${term.termId}-no-enrollments`"
              role="cell"
              class="font-italic pl-2 pb-2 text-surface-variant"
            >
              {{ `No ${term.termName} enrollments` }}
            </div>
          </div>
          <StudentCourse
            v-for="(course, courseIndex) in term.enrollments"
            :key="courseIndex"
            :column-index="columnIndex"
            :course="course"
            :index="courseIndex"
            :student="student"
            :term="term"
            :year="term.academicYear"
          />
          <div
            v-for="(droppedSection, droppedIndex) in term.droppedSections"
            :key="droppedIndex"
            class="student-course-dropped text-disabled"
            :class="{'demo-mode-blur': currentUser.inDemoMode}"
            role="row"
          >
            <div :id="`term-${term.termId}-dropped-course-${droppedIndex}`" class="text-disabled" role="cell">
              <div>
                {{ droppedSection.displayName }} - {{ droppedSection.component }} {{ droppedSection.sectionNumber }}
              </div>
              <div class="font-size-14">
                (Dropped<span v-if="droppedSection.dropDate"> as of {{ DateTime.fromISO(droppedSection.dropDate).toFormat('MMM dd, yyyy') }}</span>)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-auto">
      <v-card-subtitle class="border-t-sm pt-2 student-term-footer text-uppercase">
        <div class="d-flex justify-space-between">
          <div class="pr-1">
            <span class="font-weight-500 pr-1">Term GPA:</span>
            <span :id="`term-${term.termId}-gpa`">{{ termGpa ? round(termGpa || 0, 3) : '&mdash;' }}</span>
          </div>
          <div>
            <span class="font-weight-500 pr-1">Total Units:</span>
            <span :id="`term-${term.termId}-units`">{{ numeral(enrolledUnits).format('0.0') || '&mdash;' }}</span>
          </div>
        </div>
        <div v-if="showMinUnits || showMaxUnits" class="text-right">
          <div v-if="showMinUnits" class="pt-1">
            <span class="align-right font-weight-500 pr-1">Exception Min Units:</span>
            <span :id="`term-${term.termId}-min-units`">{{ numeral(term.minTermUnitsAllowed).format('0.0') }}</span>
          </div>
          <div v-if="showMaxUnits" class="pt-1">
            <span class="font-weight-500 pr-1">Exception Max Units:</span>
            <span :id="`term-${term.termId}-max-units`">
              {{ numeral(term.maxTermUnitsAllowed).format('0.0') }}
            </span>
          </div>
        </div>
      </v-card-subtitle>
    </div>
  </div>
</template>

<script setup>
import numeral from 'numeral'
import StudentAcademicStanding from '@/components/student/profile/StudentAcademicStanding'
import StudentCourse from '@/components/student/profile/StudentCourse'
import StudentWithdrawalCancel from '@/components/student/profile/StudentWithdrawalCancel'
import {DateTime} from 'luxon'
import {get, isEmpty, isNil, some} from 'lodash'
import {round} from '@/lib/utils'
import {useContextStore} from '@/stores/context'

const props = defineProps({
  columnIndex: {
    required: true,
    type: Number
  },
  student: {
    required: true,
    type: Object
  },
  term: {
    required: true,
    type: Object
  }
})

const contextStore = useContextStore()
const config = contextStore.config
const currentUser = contextStore.currentUser
const enrolledUnits = get(props.term, 'enrolledUnits')
const isConcurrent = some(props.term.enrollments, {academicCareer: 'UCBX'})
const isCurrentTerm = config.currentEnrollmentTermId === parseInt(props.term.termId)
const showMaxUnits = !isNil(props.term.maxTermUnitsAllowed) && props.term.maxTermUnitsAllowed !== config.defaultTermUnitsAllowed.max
const showMinUnits = !isNil(props.term.minTermUnitsAllowed) && props.term.minTermUnitsAllowed !== config.defaultTermUnitsAllowed.min
const termGpa = get(props.term, 'termGpa.gpa') || 0
</script>

<style scoped>
.student-course-column-grade {
  display: flex;
  justify-content: space-between;
  width: 15%;
}
.student-course-column-name {
  width: 60%;
}
.student-course-column-units {
  text-align: right;
  width: 15%;
}
.student-course-dropped {
  font-weight: 500;
  line-height: 1.1;
  padding: 8px 15px;
}
.student-term {
  min-width: 300px;
}
.student-term-footer {
  border-top: 1px rgba(var(--v-border-color), var(--v-border-opacity)) solid !important;
  line-height: 1.1;
  max-height: 64px;
  min-height: 64px;
}
</style>
