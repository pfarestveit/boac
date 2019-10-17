<template>
  <div class="ml-3 mt-3">
    <h1 class="sr-only">Welcome to BOA</h1>
    <Spinner />
    <div v-if="!loading">
      <div class="d-flex justify-content-between">
        <div class="column-01">
          <DropInWaitlist :dept-code="deptCode" :is-homepage="true" :waitlist="waitlist" />
        </div>
        <div class="mr-3 w-50">
          <div class="homepage-header-border">
            <h2 class="alerts-header mb-0 page-section-header">Alerts</h2>
          </div>
          <div v-if="myCohorts" class="mt-3">
            <div class="d-flex justify-content-between mr-3">
              <div>
                <h3 class="color-grey font-size-14 font-weight-bold text-uppercase">Cohorts</h3>
              </div>
              <div v-if="myCohorts.length" class="color-grey font-size-14 font-weight-bold text-uppercase">
                Total
              </div>
            </div>
            <div v-if="myCohorts.length">
              <HomeCohort
                v-for="cohort in myCohorts"
                :key="cohort.id"
                :cohort="cohort"
                :compact="true" />
            </div>
            <div v-if="!myCohorts.length">
              <div>
                You have no saved cohorts.
              </div>
              <div>
                <router-link id="create-filtered-cohort" to="/cohort/new">Create a student cohort</router-link>
                automatically by your filtering preferences, such as GPA or units.
              </div>
            </div>
            <div v-if="size(myCuratedGroups)" class="mt-4">
              <div class="d-flex justify-content-between mr-3">
                <div>
                  <h3 class="color-grey font-size-14 font-weight-bold text-uppercase">Curated Groups</h3>
                </div>
                <div v-if="myCohorts.length" class="color-grey font-size-14 font-weight-bold text-uppercase">
                  Total
                </div>
              </div>
              <HomeCuratedGroup
                v-for="curatedGroup in myCuratedGroups"
                :key="curatedGroup.id"
                :curated-group="curatedGroup"
                :compact="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DropInWaitlist from "@/components/appointment/DropInWaitlist";
import HomeCohort from '@/components/home/HomeCohort';
import HomeCuratedGroup from '@/components/home/HomeCuratedGroup';
import Loading from '@/mixins/Loading';
import Spinner from '@/components/util/Spinner';
import UserMetadata from '@/mixins/UserMetadata';
import Util from '@/mixins/Util';
import { getDropInAppointmentWaitlist } from '@/api/appointments'

export default {
  name: 'DropInAdvisorHome',
  components: {
    DropInWaitlist,
    HomeCohort,
    HomeCuratedGroup,
    Spinner
  },
  mixins: [Loading, UserMetadata, Util],
  data: () => ({
    deptCode: undefined,
    waitlist: undefined
  }),
  mounted() {
    this.deptCode = this.get(this.$route, 'params.deptCode');
    getDropInAppointmentWaitlist(this.deptCode).then(waitlist => {
      this.waitlist = waitlist;
      this.loaded();
    });
  }
}
</script>

<style scoped>
.color-grey {
  color: #999;
}
.column-01 {
  max-width: 48%;
  min-width: 48%;
  margin-right: 30px;
}
</style>

<style>
.alerts-header {
  padding-top: 5px;
}
.homepage-header-border {
  border-bottom-color: lightgrey;
  border-bottom-style: solid;
  border-bottom-width: 4px;
  max-height: 50px;
  min-height: 50px;
}
</style>