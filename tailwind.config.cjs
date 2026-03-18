/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            container: {
                center: true,
                padding: {
                    DEFAULT: '1rem',
                    sm: '2rem',
                    lg: '4rem',
                    xl: '5rem',
                    '2xl': '6rem',
                },
            },
            colors: {
                primary: {
                    light: '#eaf1ff',
                    'dark-light': 'rgba(67,97,238,.15)',
                    DEFAULT: '#610BFC',
                },
                brand: {
                    DEFAULT: '#610BFC',
                    700: '#5F478E',
                    600: '#7E5FBE',
                    500: '#9E77ED',
                    400: '#B192F1',
                    300: '#C5ADF4',
                },
                blue: {
                    DEFAULT: '#610BFC',
                },
                secondary: {
                    DEFAULT: '#FA5532',
                    light: '#ebe4f7',
                    'dark-light': 'rgb(128 93 202 / 15%)',
                },
                success: {
                    DEFAULT: '#098b6b',
                    light: '#ddf5f0',
                    'dark-light': 'rgba(0,171,85,.15)',
                },
                danger: {
                    DEFAULT: '#e7515a',
                    light: '#fff5f5',
                    'dark-light': 'rgba(231,81,90,.15)',
                },
                warning: {
                    DEFAULT: '#e2a03f',
                    light: '#fff9ed',
                    'dark-light': 'rgba(226,160,63,.15)',
                },
                info: {
                    DEFAULT: '#2196f3',
                    light: '#e7f7ff',
                    'dark-light': 'rgba(33,150,243,.15)',
                },
                dark: {
                    DEFAULT: '#3b3f5c',
                    light: '#eaeaec',
                    'dark-light': 'rgba(59,63,92,.15)',
                },
                black: {
                    DEFAULT: '#0e1726',
                    light: '#111827',
                    'dark-light': 'rgba(14,23,38,.15)',
                },
                white: {
                    DEFAULT: '#ffffff',
                    light: '#F8FAFF',
                    dark: '#888ea8',
                },
                BG: {
                    DEFAULT: '#ECF8F5',
                },
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                montserrat: ['Montserrat', 'sans-serif'],
                urbanist: ['Urbanist', 'sans-serif'],
            },
            fontWeight: {
                thin: 100,
                extralight: 200,
                light: 300,
                normal: 400,
                medium: 500,
                semibold: 600,
                bold: 700,
                extrabold: 800,
                black: 900,
            },
            spacing: {
                4.5: '18px',
            },
            boxShadow: {
                '3xl': '0 2px 2px rgb(224 230 237 / 46%), 1px 6px 7px rgb(224 230 237 / 46%)',
            },
            fontSize: {
                xsm: ['clamp(0.62rem, calc(0.58rem + 0.30vw), 0.92rem)', '1.4'],
                ssm: ['clamp(0.90rem, calc(0.57rem + 0.29vw), 1.12rem)', '1.4'],
                sm: ['clamp(0.95rem, calc(0.62rem + 0.29vw), 1.20rem)', '1.4'],
                base: ['clamp(0.70rem, calc(0.88rem + 0.19vw), 1.20rem)', '1.4'],
                lg: ['clamp(1.00rem, calc(0.88rem + 0.39vw), 1.28rem)', '1.4'],
                xl: ['clamp(1.42rem, calc(1.06rem + 0.80vw), 2.34rem)', '1.4'],
                '2xl': ['clamp(1.60rem, calc(1.08rem + 0.59vw), 2.93rem)', '1.2'],
                '3xl': ['clamp(1.80rem, calc(1.08rem + 1.63vw), 3.66rem)', '1.1'],
                '3.5xl': ['clamp(1.90rem, calc(1.15rem + 2.68vw), 3.80rem)', '1.1'],
                '4xl': ['clamp(2.00rem, calc(1.03rem + 2.98vw), 4.958rem)', '1.1'],
                '5xl': ['clamp(2.28rem, calc(0.94rem + 4.71vw), 5.72rem)', '1'],
                '6xl': ['clamp(2.57rem, calc(0.78rem + 7.95vw), 7.15rem)', '1'],
            },
            screens: {
                '2xl': '1980px',
                xl: '1440px',
                lg: '1024px',
                md: '980px',
                sm: '767px',
                xs: '425px',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
        require('@tailwindcss/typography'),
    ],
};
