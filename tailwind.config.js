module.exports = {
  content: [
    './templates/**/*.html',
    './static/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          medium: '#003662', // Azul medio (para otros elementos si es necesario)
          dark: '#0A2138',   // Azul oscuro (Navbar o Footer)
        },
        neutral: {
          white: '#FFFFFF',        // Colores Neutrales, se esta usando para la tipografia
          lightGray: '#00668E',    // Azul Grisaseo, al parecer no se esta usando
          veryLightGray: '#00C8DF', // Gris muy claro
        },
        buttonPrimary: {
          DEFAULT: '#D35F18', // Color base del botón
          dark: 'rgb(45, 86, 125)',     // Hover más oscuro
        },
        extracolor:{
          Darkcolor: '#4C0302', // este color se puede usar para remarcar o subrayar algunos textos
        },
        font: {
          white: '#FFFFFF'
          },
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
