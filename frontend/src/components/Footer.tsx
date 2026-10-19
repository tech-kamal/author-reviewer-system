function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">

          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              TSP Reviewer System
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              A structured platform for research paper peer review.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-5 text-sm text-gray-500 dark:text-gray-400">
            <span>Home</span>
            <span>Services</span>
            <span>Information</span>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          © {currentYear} Techno Sky Publications Reviewer System. All rights reserved.
        </div>

      </div>
    </footer>
  );
}

export default Footer;