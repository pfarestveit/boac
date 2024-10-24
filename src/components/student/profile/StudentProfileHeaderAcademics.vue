<template>
  <div v-if="academicCareerStatus !== 'Completed'">
    <div v-if="size(plansPartitionedByStatus[0])" id="student-bio-majors" class="mb-3">
      <h3 v-if="isGraduate(student)" class="student-profile-h3">Academic Plan</h3>
      <h3 v-if="!isGraduate(student)" class="student-profile-h3">Major</h3>
      <StudentProfilePlan
        v-for="plan in plansPartitionedByStatus[0]"
        :key="plan.description"
        :plan="plan"
        :active="true"
      />
    </div>
    <div v-if="size(plansMinorPartitionedByStatus[0])" id="student-bio-minors" class="mb-3">
      <h3 v-if="size(plansMinorPartitionedByStatus[0]) > 1" class="student-profile-h3">Minors</h3>
      <h3 v-if="size(plansMinorPartitionedByStatus[0]) === 1" class="student-profile-h3">Minor</h3>
      <StudentProfilePlan
        v-for="plan in plansMinorPartitionedByStatus[0]"
        :key="plan.description"
        :plan="plan"
        :active="true"
      />
    </div>
    <div v-if="size(activeSubplans)" id="student-bio-subplans" class="mb-3">
      <h3 class="student-profile-h3">{{ pluralize('Subplan', activeSubplans.length) }}</h3>
      <div
        v-for="(subplan, index) in activeSubplans"
        :key="index"
        class="font-weight-bold mb-2"
      >
        {{ subplan }}
      </div>
    </div>
    <div
      v-if="isEmpty(plansPartitionedByStatus[0]) && size(plansPartitionedByStatus[1])"
      id="student-details-discontinued-majors-outer"
      class="mb-3"
    >
      <h3 class="student-profile-h3">
        Discontinued Major(s)
      </h3>
      <div id="student-details-discontinued-majors">
        <StudentProfilePlan
          v-for="plan in plansPartitionedByStatus[1]"
          :key="plan.description"
          :plan="plan"
          :active="false"
        />
      </div>
    </div>
    <div
      v-if="isEmpty(plansPartitionedByStatus[0]) && size(plansMinorPartitionedByStatus[1])"
      id="student-details-discontinued-minors-outer"
      class="mb-3"
    >
      <h3 class="student-profile-h3">
        Discontinued Minor(s)
      </h3>
      <div id="student-details-discontinued-minors">
        <StudentProfilePlan
          v-for="plan in plansMinorPartitionedByStatus[1]"
          :key="plan.description"
          :active="false"
          :plan="plan"
        />
      </div>
    </div>
    <div
      v-if="!size(plansPartitionedByStatus[0]) && size(discontinuedSubplans)"
      id="student-bio-subplans"
      class="mb-3"
    >
      <h3 class="student-profile-h3">{{ pluralize('Discontinued Subplan', discontinuedSubplans.length) }}</h3>
      <div
        v-for="(subplan, index) in discontinuedSubplans"
        :key="index"
        class="font-weight-bold mb-2"
      >
        {{ subplan }}
      </div>
    </div>
  </div>
  <div v-if="academicCareerStatus === 'Completed' && size(student.sisProfile.degrees)" class="mb-3">
    <h3 class="student-profile-h3">Degree{{ size(student.sisProfile.degrees) === 1 ? '' : 's' }}</h3>
    <div v-for="(degree, index) in student.sisProfile.degrees" :key="degree.plan">
      <div :id="`student-bio-degree-type-${index}`" class="font-weight-bold" :class="{'mt-2': index > 0}">
        <span v-if="!includes(degree.planOwners, 'Graduate Division')">
          {{ degree.description }} in
        </span>
        {{ degree.plans.filter(plan => planTypes.includes(plan.type)).map(degree => degree.plan).join(', ') }}
      </div>
      <div class="font-size-13 text-medium-emphasis">
        Awarded {{ DateTime.fromISO(degree.dateAwarded).toLocaleString(DateTime.DATE_MED) }}
      </div>
      <div v-for="owner in degree.planOwners" :key="owner" class="font-size-13 text-medium-emphasis">
        {{ owner }}
      </div>
      <div v-if="size(degree.minorPlans) > 0">
        <h3 v-if="size(degree.minorPlans) === 1" class="student-profile-h3 mt-3">Minor</h3>
        <h3 v-if="size(degree.minorPlans) > 1" class="student-profile-h3 mt-3">Minors</h3>
        <div v-for="minorPlan in degree.minorPlans" :key="minorPlan">
          <div id="student-bio-degree-type" class="font-weight-bold">
            {{ minorPlan + " UG" }}
          </div>
        </div>
        <span class="font-size-13 text-medium-emphasis">Awarded {{ DateTime.fromISO(degree.dateAwarded).toFormat('MMM dd, yyyy') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import StudentProfilePlan from '@/components/student/profile/StudentProfilePlan'
import {compact as _compact, each, get, includes, isEmpty, map, size, uniq} from 'lodash'
import {DateTime} from 'luxon'
import {isGraduate} from '@/berkeley'
import {onMounted, ref} from 'vue'
import {pluralize} from '@/lib/utils'

const props = defineProps({
  compact: {
    required: false,
    type: Boolean
  },
  discontinuedSubplans: {
    default: () => [],
    required: false,
    type: Array
  },
  linkToStudentProfile: {
    required: false,
    type: Boolean
  },
  plansMinorPartitionedByStatus: {
    default: () => [],
    required: false,
    type: Array
  },
  plansPartitionedByStatus: {
    default: () => [],
    required: false,
    type: Array
  },
  student: {
    required: true,
    type: Object
  }
})

const academicCareerStatus = ref([])
const activeSubplans = ref([])
const planTypes = ['MAJ', 'SS', 'SP', 'SH', 'CRT']

onMounted(() => {
  academicCareerStatus.value = get(props.student, 'sisProfile.academicCareerStatus')
  activeSubplans.value = _compact(map(props.plansPartitionedByStatus[0], 'subplan'))
  each(props.student.sisProfile.degrees, degree => {
    degree.planOwners = uniq(map(degree.plans, 'group'))
    degree.minorPlans = degree.plans.filter(plan => plan.type === 'MIN').map(minor => minor.plan).map(part => part.replace('Minor in ', ''))
  })
})
</script>
