import _ from 'lodash'
import Vue from 'vue'
import {
  addUnitRequirement,
  assignCourse,
  copyCourseAndAssign,
  createDegreeCategory,
  deleteDegreeCategory,
  deleteUnitRequirement,
  getDegreeTemplate,
  updateCategory,
  updateCourse,
  updateDegreeNote,
  updateUnitRequirement
} from '@/api/degree'

const VALID_DRAG_DROP_CONTEXTS = ['assigned', 'requirement', 'unassigned']

const $_allowCourseDrop = (category, courseId) => {
  return (category.categoryType !== 'Course Requirement' || !category.courseIds.length)
    && (category.categoryType !== 'Category' || !category.subcategories.length)
    && !category.courseIds.includes(courseId)
}

const $_debug = message => Vue.prototype.$config.isVueAppDebugMode && console.log(message)

const $_dropToAssign = (categoryId, commit, courseId, state) => {
  commit('setDisableButtons', true)
  return assignCourse(courseId, categoryId).then(() => {
    $_refresh(commit, state.templateId).then(() => {
      commit('draggingContextReset')
      commit('setDisableButtons', false)
    })
  })
}

const $_resetDraggingContext = state => state.draggingContext = {
  courseId: undefined,
  dragContext: undefined,
  target: undefined
}

const $_refresh = (commit, templateId) => {
  return new Promise<void>(resolve => {
    getDegreeTemplate(templateId).then((template: any) => {
      commit('resetSession', template)
      return resolve()
    })
  })
}

const state = {
  addCourseMenuOptions: undefined,
  categories: undefined,
  courses: undefined,
  createdAt: undefined,
  createdBy: undefined,
  degreeName: undefined,
  degreeNote: undefined,
  disableButtons: false,
  dismissedAlerts: [],
  draggingContext: {
    courseId: undefined,
    dragContext: undefined,
    target: undefined
  },
  includeNotesWhenPrint: true,
  parentTemplateUpdatedAt: undefined,
  sid: undefined,
  templateId: undefined,
  unitRequirements: undefined,
  updatedAt: undefined,
  updatedBy: undefined
}

const getters = {
  addCourseMenuOptions: (state: any): any[] => state.addCourseMenuOptions,
  categories: (state: any): any[] => state.categories,
  courses: (state: any): any[] => state.courses,
  createdAt: (state: any): any[] => state.createdAt,
  createdBy: (state: any): any[] => state.createdBy,
  degreeEditSessionToString: (state: any): any => ({
    categories: state.categories,
    courses: state.courses,
    degreeName: state.degreeName,
    degreeNote: state.degreeNote,
    disableButtons: state.disableButtons,
    templateId: state.templateId,
    unitRequirements: state.unitRequirements
  }),
  degreeName: (state: any): string => state.degreeName,
  degreeNote: (state: any): string => state.degreeNote,
  disableButtons: (state: any): boolean => state.disableButtons,
  dismissedAlerts: (state: any): number[] => state.dismissedAlerts,
  draggingContext: (state: any): any => state.draggingContext,
  includeNotesWhenPrint: (state: any): boolean => state.includeNotesWhenPrint,
  isUserDragging: (state: any) => (courseId: number) => !!courseId && state.draggingContext.courseId === courseId,
  parentTemplateUpdatedAt: (state: any): string => state.parentTemplateUpdatedAt,
  sid: (state: any): string => state.sid,
  templateId: (state: any): number => state.templateId,
  unitRequirements: (state: any): any[] => state.unitRequirements,
  updatedAt: (state: any): any[] => state.updatedAt,
  updatedBy: (state: any): any[] => state.updatedBy
}

const mutations = {
  addUnitRequirement: (state: any, unitRequirement: any) => state.unitRequirements.push(unitRequirement),
  draggingContextReset: (state: any) => $_resetDraggingContext(state),
  dragStart: (state: any, {courseId, dragContext}) => state.draggingContext = {courseId, dragContext, target: undefined},
  dismissAlert: (state: any, templateId: number) => state.dismissedAlerts.push(templateId),
  removeUnitRequirement: (state: any, index: number) => state.unitRequirements.splice(index, 1),
  resetSession: (state: any, template: any) => {
    state.disableButtons = false
    $_resetDraggingContext(state)
    if (template) {
      state.categories = template.categories
      state.courses = template.courses
      state.createdAt = template.createdAt
      state.createdBy = template.createdBy
      state.degreeName = template.name
      state.degreeNote = template.note
      state.parentTemplateUpdatedAt = template.parentTemplateUpdatedAt
      state.sid = template.sid
      state.templateId = template.id
      state.unitRequirements = template.unitRequirements
      state.updatedAt = template.updatedAt
      state.updatedBy = template.updatedBy
    } else {
      state.categories = state.createdAt = state.createdBy = state.degreeName = state.degreeNote = undefined
      state.templateId = state.sid = state.unitRequirements = state.updatedAt = state.updatedBy = undefined
    }
  },
  setDisableButtons: (state: any, disableAll: any) => state.disableButtons = disableAll,
  setDraggingTarget: (state: any, target: any) => state.draggingContext.target = target,
  setIncludeNotesWhenPrint: (state: any, include: any) => state.includeNotesWhenPrint = include,
  updateUnitRequirement: (state: any, {index, unitRequirement}) => state.unitRequirements[index] = unitRequirement
}

const actions = {
  assignCourseToCategory: ({commit, state}, {course, category}) => {
    return new Promise<void>(resolve => {
      const categoryId = category && category.id
      assignCourse(course.id, categoryId).then(() => $_refresh(commit, state.templateId)).then(resolve)
    })
  },
  copyCourseAndAssign: ({commit, state}, {categoryId, sectionId, sid, termId}) => {
    return new Promise<void>(resolve => {
      copyCourseAndAssign(categoryId, sectionId, sid, termId).then(() => $_refresh(commit, state.templateId)).then(resolve)
    })
  },
  createCategory: ({commit, state}, {
    categoryType,
    description,
    name,
    parentCategoryId,
    position,
    unitRequirementIds,
    unitsLower,
    unitsUpper
  }) => {
    return new Promise(resolve => {
      createDegreeCategory(
        categoryType,
        description,
        name,
        parentCategoryId,
        position,
        state.templateId,
        unitRequirementIds,
        unitsLower,
        unitsUpper
      ).then(category => {
        $_refresh(commit, state.templateId).then(() => resolve(category))
      })
    })
  },
  createUnitRequirement: ({commit, state}, {name, minUnits}) => {
    return new Promise<void>(resolve => {
      addUnitRequirement(state.templateId, name, minUnits).then(unitRequirement => {
        commit('addUnitRequirement', unitRequirement)
        resolve()
      })
    })
  },
  deleteCategory: ({commit, state}, categoryId: number) => {
    return new Promise(resolve => {
      deleteDegreeCategory(categoryId).then(() => $_refresh(commit, state.templateId)).then(resolve)
    })
  },
  deleteUnitRequirement: ({commit, state}, index: number) => {
    return new Promise<void>(resolve => {
      const id = _.get(state.unitRequirements[index], 'id')
      deleteUnitRequirement(id).then(() => {
        commit('removeUnitRequirement', index)
        resolve()
      })
    })
  },
  dismissAlert: ({commit}, templateId: number) => commit('dismissAlert', templateId),
  setDraggingTarget: ({commit}, target: any) => commit('setDraggingTarget', target),
  init: ({commit}, templateId: number) => new Promise<void>(resolve => $_refresh(commit, templateId).then(resolve)),
  onDragEnd: ({commit}) => commit('draggingContextReset'),
  onDragStart: ({commit}, {courseId, dragContext}) => commit('dragStart', {courseId, dragContext}),
  onDrop: ({commit}, {category, context}) => {
    return new Promise<void>(resolve => {
      const courseId = state.draggingContext.courseId
      const dragContext = state.draggingContext.dragContext
      const actionByUser = `${dragContext} to ${context}`

      const done = (srAlert: string, noActionTaken?: boolean) => {
        Vue.prototype.$announcer.polite(srAlert)
        if (noActionTaken) {
          $_debug(srAlert)
        } else {
          if (context === 'unassigned') {
            $_debug(`Course ${courseId} (${dragContext}) dragged to unassigned section.`)
          } else {
            $_debug(`From ${actionByUser}: course ${courseId} (${dragContext}) dragged to category ${_.get(category, 'id')} (${context})`)
          }
        }
        resolve()
      }
      const valid = _.includes(VALID_DRAG_DROP_CONTEXTS, dragContext) && _.includes(VALID_DRAG_DROP_CONTEXTS, context)
      if (valid) {
        switch (actionByUser) {
          case 'assigned to unassigned':
            $_dropToAssign(null, commit, courseId, state).then(() => done('Course unassigned'))
            break
          case 'assigned to assigned':
          case 'unassigned to assigned':
            $_dropToAssign(category.id, commit, courseId, state).then(() => done(`Course assigned to ${category.name}`))
            break
          case 'assigned to requirement':
          case 'unassigned to requirement':
            if ($_allowCourseDrop(category, courseId)) {
              $_dropToAssign(category.id, commit, courseId, state).then(() => done(`Course assigned to ${category.name}`))
            } else {
              done('Drop canceled. No assignment made.', true)
            }
            break
          case 'unassigned to unassigned':
            done('Course not assigned.', true)
            break
          default:
            done(`Unrecognized operation: ${actionByUser}`, true)
            commit('draggingContextReset')
            throw new TypeError(`Unrecognized transaction type where dragContext = '${dragContext}' and dropContext = '${context}'`)
        }

      } else {
        done('Error: Unrecognized operation', true)
        commit('draggingContextReset')
        throw new TypeError(`Invalid context(s): dragContext = '${dragContext}' and dropContext = '${context}'`)
      }
    })
  },
  setDisableButtons: ({commit}, disable: boolean) => commit('setDisableButtons', disable),
  setIncludeNotesWhenPrint: ({commit}, include: boolean) => commit('setIncludeNotesWhenPrint', include),
  updateCourse: ({commit, state}, {courseId, note, unitRequirementIds, units}) => {
    return new Promise(resolve => {
      updateCourse(courseId, note, unitRequirementIds, units).then(data => {
        $_refresh(commit, state.templateId).then(() => resolve(data))
      })
    })
  },
  updateNote: ({commit, state}, noteBody: string) => {
    return new Promise<void>(resolve => {
      updateDegreeNote(state.templateId, noteBody).then((note: any) => {
        $_refresh(commit, state.templateId).then(() => resolve(note))
      })
    })
  },
  updateUnitRequirement: ({commit, state}, {index, name, minUnits}) => {
    return new Promise<void>(resolve => {
      const id = _.get(state.unitRequirements[index], 'id')
      updateUnitRequirement(id, name, minUnits).then(
        unitRequirement => {
          commit('updateUnitRequirement', {index, unitRequirement})
          resolve()
        }
      )
    })
  },
  updateCategory: ({commit, state}, {
    categoryId,
    description,
    name,
    parentCategoryId,
    unitRequirementIds,
    unitsLower,
    unitsUpper
  }) => {
    return new Promise(resolve => {
      updateCategory(
        categoryId,
        description,
        name,
        parentCategoryId,
        unitRequirementIds,
        unitsLower,
        unitsUpper
      ).then(() => $_refresh(commit, state.templateId)).then(resolve)
    })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
