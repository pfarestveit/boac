<template>
  <div class="d-flex flex-wrap justify-space-between px-3 pt-10 pb-4 w-100">
    <div>
      <img alt="UC Berkeley logo" src="@/assets/uc-berkeley-logo.svg" />
    </div>
    <div class="font-size-14 pr-0">
      <div>
        Problem? Question? Suggestion?
        <a :href="`mailto:${supportEmailAddress}`" target="_blank">Email {{ supportEmailAddress }} <span class="sr-only"> (will open new browser tab)</span></a>
      </div>
      <div>
        &copy; {{ new Date().getFullYear() }} The Regents of the University of California
      </div>
    </div>
  </div>
</template>

<script setup>
import {useContextStore} from '@/stores/context'

const supportEmailAddress = useContextStore().config.supportEmailAddress
</script>
