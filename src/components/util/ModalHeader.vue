<template>
  <h3
    :id="headerId"
    class="font-size-24 font-weight-medium mx-2"
    :class="clazz"
  >
    {{ text }}
    <slot />
  </h3>
</template>

<script setup>
defineProps({
  clazz: {
    default: '',
    required: false,
    type: String
  },
  headerId: {
    default: 'modal-header',
    required: false,
    type: String
  },
  text: {
    default: '',
    required: false,
    type: String
  }
})
</script>
