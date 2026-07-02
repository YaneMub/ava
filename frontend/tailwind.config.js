/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lavanda: '#9395F5',
        fondo: '#f4f5ff',
        azulNoche: '#1a1c70',
        solDorado: '#f0c040',
        textoPrincipal: '#1e2080',
        textoSecundario: '#7a7cc0',
        textoBotonOutline: '#3a3db0',
        exito: '#27ae6a',
        fondoExito: '#e6f8ef',
        error: '#e74c3c',
        fondoError: '#fde8e8',
        advertencia: '#fff3cd',
        borde: '#e0dcf7',
      },
      fontFamily: {
         sans: ['Nunito', 'sans-serif']
      } 
    },
  },
  plugins: [],
}
