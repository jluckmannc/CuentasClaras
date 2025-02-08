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
      width: {
        '2': '0.5rem',     // 8px
        '4': '1rem',        // 16px
        '6': '1.5rem',      // 24px
        '8': '2rem',        // 32px
        '10': '2.5rem',     // 40px
        '12': '3rem',       // 48px
        '14': '3.5rem',     // 56px
        '16': '4rem',       // 64px
        '20': '5rem',       // 80px
        '24': '6rem',       // 96px
        '28': '7rem',       // 112px
        '32': '8rem',       // 128px
        '36': '9rem',       // 144px
        '40': '10rem',      // 160px
        '44': '11rem',      // 176px
        '48': '12rem',      // 192px
        '52': '13rem',      // 208px
        '56': '14rem',      // 224px
        '60': '15rem',      // 240px
        '64': '16rem',      // 256px
        '72': '18rem',      // 288px
        '80': '20rem',      // 320px
        '96': '24rem',       // 384px
        '100': '25rem',     // 400px
        '112': '28rem',     // 448px
        '128': '32rem',     // 512px
        '144': '36rem',     // 576px
        '160': '40rem',     // 640px
        '176': '44rem',     // 704px
        '192': '48rem',     // 768px
        '200': '50rem'      // 800px
      },
    },
    fontFamily: {
      logo: ['Jersey 10', 'sans-serif'],
      title: ['Jaro', 'serif'],
      body: ['Joan', 'serif'],
      input: ['Joan', 'serif'],
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
