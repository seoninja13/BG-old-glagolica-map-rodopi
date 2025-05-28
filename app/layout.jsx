// app/layout.jsx
import '@/styles/globals.css';

export const metadata = {
  title: 'Interactive Triangle Map - Rodopi',
  description: 'Interactive geographic triangle connecting important historical locations in Bulgaria',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
