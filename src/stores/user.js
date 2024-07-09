import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";
import { ref } from "vue";

export const useUserRol = defineStore("user", () => {
  const customClaim = ref(false);

  function setCustomClaim(token) {
    const { admin } = jwtDecode(token);
    customClaim.value = admin;
    localStorage.setItem("token", token);
  }

  function getCustomClaim() {
    const token = localStorage.getItem("token");
    if (token) {
      const { admin } = jwtDecode(token);
      customClaim.value = admin;
    }
  }

  return { customClaim, setCustomClaim, getCustomClaim };
});
