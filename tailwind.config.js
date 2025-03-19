/** @type {import('tailwindcss').Config} */
export default {
  content: [ "./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}",  "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      backgroundImage: {
        'home-1': 'url("https://firebasestorage.googleapis.com/v0/b/mfactory-ede9a.appspot.com/o/images%2Fweb%2Fhome-image-1.jpg?alt=media&token=236767ae-30da-4555-8d26-da9ea888044a")'
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

