const colors = require('tailwindcss/colors')

module.exports = {
    content: ["./app/templates/**/*.html", "./app/static/js/**/*.js"],
    theme: {
        screens: {
            sm: '480px',
            md: '768px',
            lg: '976px',
            xl: '1440px',
        },
        colors: {
            ...colors,
            'primary': '#FFF633',
            'secondary': '#00AFF0',
            'navy': '#003478',
        },
        fontFamily: {
            sans: ['Graphik', 'sans-serif'],
            serif: ['Merriweather', 'serif'],
        },
        extend: {
            spacing: {
                '128': '32rem',
                '144': '36rem',
            },
            borderRadius: {
                '4xl': '2rem',
            }
        }
    },
    variants: {
        extend: {
            backgroundColor: ['hover', 'focus'],
        },
    },
    plugins: [],
}
