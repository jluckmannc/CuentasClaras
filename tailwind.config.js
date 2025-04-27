module.exports = {
  content: [
    './templates/**/*.html',
    './static/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        // Colores principales
        primary: {
          DEFAULT: '#0077ff',      // Azul vibrante (botones principales)
          dark: '#0a2540',          // Azul oscuro real para navbar
          light: '#f1f6fb',         // Azul hielo (fondos principales)
        },

        // Colores de acción
        secondary: {
          DEFAULT: '#ff7b6b',      // Coral suave (acciones secundarias)
          hover: '#ff5a4d',        // Coral más intenso en hover
        },

        // Colores neutros
        neutral: {
          DEFAULT: '#ffffff',      // Blanco puro (fondos de cajas, tarjetas)
          dark: '#1d3557',          // Azul oscuro para texto principal
          mid: '#6c757d',           // Gris medio para textos secundarios
          light: '#e0e0e0',         // Gris claro para bordes y detalles
        },

        // Colores de estados / acentos
        accent: {
          success: '#48cae4',       // Verde menta suave (pasos completados, highlights)
          warning: '#ff3b30',       // Rojo claro para alertas (mantenido si necesitas)
        }
      },
      width: {
        '2': '0.5rem', '4': '1rem', '6': '1.5rem', '8': '2rem',
        '10': '2.5rem', '12': '3rem', '14': '3.5rem', '16': '4rem',
        '20': '5rem', '24': '6rem', '28': '7rem', '32': '8rem',
        '36': '9rem', '40': '10rem', '44': '11rem', '48': '12rem',
        '52': '13rem', '56': '14rem', '60': '15rem', '64': '16rem',
        '72': '18rem', '80': '20rem', '96': '24rem', '100': '25rem',
        '112': '28rem', '128': '32rem', '144': '36rem', '160': '40rem',
        '176': '44rem', '192': '48rem', '200': '50rem'
      },
      fontFamily: {
        logo: ['Poppins', 'sans-serif'],
        title: ['Poppins', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
        input: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
