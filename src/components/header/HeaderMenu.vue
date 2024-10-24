<template>
  <div class="d-flex justify-space-around">
    <v-menu
      transition="slide-y-transition"
      variant="link"
    >
      <template #activator="{ props }">
        <v-btn
          id="header-dropdown-under-name"
          class="menu-activator-btn text-body-1"
          color="white"
          size="large"
          v-bind="props"
          variant="text"
        >
          {{ currentUser.firstName || `UID:${currentUser.uid}` }}
          <v-icon :icon="mdiMenuDown" size="24" />
        </v-btn>
      </template>
      <v-list variant="flat" class="remove-scroll">
        <v-list-item-action v-if="currentUser.canReadDegreeProgress">
          <v-btn
            id="header-menu-degree-check"
            class="justify-start w-100"
            to="/degrees"
            variant="text"
          >
            Degree Checks
          </v-btn>
        </v-list-item-action>
        <v-list-item-action v-if="currentUser.isAdmin || myDirectorDepartment">
          <v-btn
            id="header-menu-analytics"
            :to="currentUser.isAdmin ? '/analytics/qcadv' : `/analytics/${myDirectorDepartment.toLowerCase()}`"
            class="justify-start w-100"
            variant="text"
          >
            Flight Data Recorder
          </v-btn>
        </v-list-item-action>
        <v-list-item-action v-if="currentUser.isAdmin">
          <v-btn
            id="header-menu-flight-deck"
            class="justify-start w-100"
            to="/admin"
            variant="text"
          >
            Flight Deck
          </v-btn>
        </v-list-item-action>
        <v-list-item-action v-if="currentUser.isAdmin">
          <v-btn
            id="header-menu-passengers"
            class="justify-start w-100"
            to="/admin/passengers"
            variant="text"
          >
            Passenger Manifest
          </v-btn>
        </v-list-item-action>
        <v-list-item-action
          v-if="!currentUser.isAdmin"
        >
          <v-btn
            id="header-menu-profile"
            class="justify-start w-100"
            to="/profile"
            variant="text"
          >
            Profile
          </v-btn>
        </v-list-item-action>
        <v-list-item-action>
          <v-btn
            aria-label="Send email to the BOA team"
            class="justify-start w-100"
            :href="`mailto:${contextStore.config.supportEmailAddress}`"
            target="_blank"
            variant="text"
          >
            Feedback/Help<span class="sr-only"> (new browser tab will open)</span>
          </v-btn>
        </v-list-item-action>
        <v-list-item-action>
          <v-btn
            id="header-menu-log-out"
            class="justify-start w-100"
            variant="text"
            @click="logOut"
          >
            Log Out
          </v-btn>
        </v-list-item-action>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup>
import {getCasLogoutUrl} from '@/api/auth'
import {mdiMenuDown} from '@mdi/js'
import {myDeptCodes} from '@/berkeley'
import {reactive} from 'vue'
import {useContextStore} from '@/stores/context'

const contextStore = useContextStore()
const currentUser = reactive(contextStore.currentUser)
const deptCodes = myDeptCodes(['director'])
const myDirectorDepartment = deptCodes && deptCodes[0]

const logOut = () => getCasLogoutUrl().then(data => window.location.href = data.casLogoutUrl)
</script>

<style scoped>
.menu-activator-btn {
  padding-left: 10px;
  padding-right: 4px;
}
.remove-scroll {
  overflow: hidden !important;
}
</style>
