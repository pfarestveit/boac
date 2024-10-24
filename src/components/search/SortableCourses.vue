<template>
  <v-data-table-virtual
    :cell-props="data => ({
      class: 'pl-0 vertical-top',
      'data-label': data.column.title,
      id: `td-term-${data.item.termId}-section-${data.item.sectionId}-column-${data.column.key}`,
      style: $vuetify.display.mdAndUp ? 'max-width: 200px;' : ''
    })"
    class="responsive-data-table"
    density="compact"
    :header-props="{class: 'pl-0'}"
    :headers="[
      {key: 'section', sortable: false, title: 'Section', width: '220px'},
      {key: 'courseName', sortable: false, title: 'Course Name', width: '360px'},
      {key: 'instructors', sortable: false, title: 'Instructor(s)'}
    ]"
    :items="items"
    mobile-breakpoint="md"
    no-sort-reset
    :row-props="data => ({
      id: `tr-term-${data.item.termId}-section-${data.item.sectionId}`
    })"
  >
    <template #item.section="{item}">
      <span class="sr-only">Section</span>
      <router-link :to="`/course/${item.termId}/${item.sectionId}`">
        {{ item.courseName }} - {{ item.instructionFormat }} {{ item.sectionNum }}
      </router-link>
    </template>
    <template #item.courseName="{item}">
      <span class="sr-only">Course Name</span>
      {{ item.courseTitle }}
    </template>
    <template #item.instructors="{item}">
      <span v-if="size(item.instructors)">
        {{ item.instructors }}
      </span>
      <span v-if="!size(item.instructors)">
        &mdash;
      </span>
    </template>
  </v-data-table-virtual>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {size} from 'lodash'

const props = defineProps({
  courses: {
    required: true,
    type: Array
  }
})

const items = ref([])

onMounted(() => {
  items.value = [...props.courses].sort((c1, c2) => {
    // If sorting by section name, attempt to compare by subject area.
    let split1 = splitCourseName(c1)
    let split2 = splitCourseName(c2)
    if (split1[0] > split2[0]) {
      return 1
    }
    if (split1[0] < split2[0]) {
      return -1
    }
    // If subject areas are identical, extract and compare numeric portion of catalog id.
    let code1 = parseInt(split1[1].match(/\d+/)[0], 10)
    let code2 = parseInt(split2[1].match(/\d+/)[0], 10)
    if (code1 > code2) {
      return 1
    }
    if (code1 < code2) {
      return -1
    }
    // If catalog ids are numerically identical then handle prefixes and suffixes with alphabetic comparison.
    if (split1[1] > split2[1]) {
      return 1
    }
    if (split1[1] < split2[1]) {
      return -1
    }
    // Instruction format and section number.
    if (c1.instructionFormat > c2.instructionFormat) {
      return 1
    }
    if (c1.instructionFormat < c2.instructionFormat) {
      return -1
    }
    return c1.sectionNum > c2.sectionNum ? 1 : -1
  })
})

const splitCourseName = course => {
  let split = course.courseName.split(' ')
  return [split.slice(0, -1).join(' '), split[split.length - 1]]
}
</script>
