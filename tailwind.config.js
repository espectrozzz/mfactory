/** @type {import('tailwindcss').Config} */
export default {
  content: [ "./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}",  "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      backgroundImage: {
        'home-1': 'url("./src/assets/img/home-image-1.jpg")'
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

