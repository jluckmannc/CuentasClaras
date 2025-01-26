module.exports = {
  content: [
    './templates/**/*.html',
    './static/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          medium: '#072E33', // Verde medio (para otros elementos si es necesario)
          dark: '#1A334A',   // Verde oscuro (Navbar o Footer)
        },
        neutral: {
          white: '#6DA5C0',        // Azul Cielo
          lightGray: '#0F969C',    // Gris claro
          veryLightGray: '#0f969C', // Gris muy claro
        },
        buttonPrimary: {
          DEFAULT: '#294D61', // Color base del botón
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
