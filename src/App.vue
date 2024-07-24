<script setup>
import { ref } from "vue"
import { RouterLink, RouterView } from "vue-router";
import LoginTemplate from "./templates/LoginTemplate.vue";
import AuthorizedTemplate from "./templates/AuthorizedTemplate.vue";

const mobile = ref(false);

const checkScreen = () => {
  const windowsWidth = window.innerWidth;
  if (windowsWidth <= 768) {
    mobile.value = true;
    return;
  }
  mobile.value = false;
  // store.state.c.mobileNav = false;
  return;
}
window.addEventListener("resize", checkScreen);
checkScreen();

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

