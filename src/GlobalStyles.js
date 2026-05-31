import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --brand-teal: #12b3b0;
    --brand-teal-dark: #0b8e8b;
    --brand-orange: #ff8a2a;
    --brand-navy: #0b2b45;
    --surface: rgba(255, 255, 255, 0.92);
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: radial-gradient(1200px 700px at 10% 10%, rgba(18, 179, 176, 0.35), transparent 60%),
      radial-gradient(900px 600px at 90% 20%, rgba(255, 138, 42, 0.28), transparent 55%),
      linear-gradient(135deg, #0b2b45 0%, #0b8e8b 100%);
    min-height: 100vh;
    overflow-x: hidden;
  }

  #root {
    min-height: 100vh;
  }
`;
