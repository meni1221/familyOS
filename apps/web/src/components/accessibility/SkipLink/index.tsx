const SkipLink = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-forest focus:text-white focus:rounded-4 focus:shadow-modal focus:outline-none"
    >
                  דלג לתוכן עיקרי
          </a>
  );
};

export default SkipLink;
