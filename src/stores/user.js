import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";
import { ref } from "vue";

export const useUserRol = defineStore("user", () => {
  const customClaim = ref("");

  function setCustomClaim(token) {
    const { rol } = jwtDecode(token);
    customClaim.value = rol;
    localStorage.setItem("token", token);
  }

  function getCustomClaim() {
    const token = localStorage.getItem("token");
    if (token) {
      const { rol } = jwtDecode(token);
      customClaim.value = rol;
    }
  }

  return { customClaim, setCustomClaim, getCustomClaim };
});
