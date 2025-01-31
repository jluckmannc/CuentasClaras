module.exports = {
  content: [
    './templates/**/*.html',
    './static/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal
        primary: {
          DEFAULT: '#0A2138',    // Azul oscuro (navbar/footer)
          light: '#003662',      // Azul medio
          accent: '#00C8DF'      // Azul claro (detalles)
        },
        
        // Colores de acción
        secondary: {
          DEFAULT: '#D35F18',    // Naranja principal (botones)
          hover: '#B84D0F'       // Naranja oscuro (hover)
        },
        
        // Colores neutros
        neutral: {
          DEFAULT: '#FCFCFC',    // Gris muy claro (fondos)
          dark: '#00668E'        // Gris-azulado (bordes/texto)
        },
        
        // Colores acentuales
        accent: {
          DEFAULT: '#4C0302',    // Rojo oscuro (destacados)
          warning: '#FF3B30'     // Rojo claro (alertas)
        }
      },
    },
    fontFamily: {
      logo: ['Jersey 10', 'sans-serif'],
      title: ['Jaro', 'serif'],
      body: ['Joan', 'serif'],
    },
  },
  plugins: [],
}
// module.exports = {
//   content: [
//     './templates/**/*.html',
//     './static/**/*.js',
//   ],
//   theme: {
//     extend: {
//       colors: {
//         primary: {
//           medium: '#4678B0', // Azul medio (para otros elementos si es necesario)
//           dark: '#2D567D',   // Azul oscuro (Navbar o Footer)
//         },
//         font: {
//           white: '#FFFFFF'
//         },
//         neutral: {
//           lightGray: '#D9D9D9',    // Gris claro
//           veryLightGray: '#FCFCFC', // Gris muy claro
//         },
//         buttonPrimary: {
//           DEFAULT: '#B07846', // Color base del botón
//           dark: 'rgb(45, 86, 125)',     // Hover más oscuro
//         },
//       },
//       fontFamily: {
//         logo: ['Jersey 10', 'sans-serif'],
//         title: ['Jaro', 'serif'],
//         body: ['Joan', 'serif'],
//       },
//     },
//   },
//   plugins: [],
// }
