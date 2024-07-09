<script setup>
import { RouterLink, RouterView } from "vue-router";
import LoginTemplate from "./templates/LoginTemplate.vue";
import AuthorizedTemplate from "./templates/AuthorizedTemplate.vue";


</script>

<template>
  <div>
    <component
      :is="$route.meta?.layout ? LoginTemplate : AuthorizedTemplate"
      :isMobile="mobile"
    >
      <RouterView />
    </component>
  </div>
</template>

