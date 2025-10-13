// File: /src/components/Footer.js
export default function Footer() {
    return (
      <footer className="bg-white shadow mt-8">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Report Service
        </div>
      </footer>
    );
  }
  