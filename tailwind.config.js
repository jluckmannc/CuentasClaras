module.exports = {
  content: [
    './templates/**/*.html',
    './static/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          medium: '#4678B0', // Azul medio (para otros elementos si es necesario)
          dark: '#2D567D',   // Azul oscuro (Navbar o Footer)
        },
        neutral: {
          white: '#FFFFFF',        // Blanco
          lightGray: '#D9D9D9',    // Gris claro
          veryLightGray: '#FCFCFC', // Gris muy claro
        },
        buttonPrimary: {
          DEFAULT: '#B07846', // Color base del botón
          dark: 'rgb(45, 86, 125)',     // Hover más oscuro
        },
      },
      fontFamily: {
        logo: ['Jersey 10', 'sans-serif'],
        title: ['Jaro', 'serif'],
        body: ['Joan', 'serif'],
      },
    },
  },
  plugins: [],
}
