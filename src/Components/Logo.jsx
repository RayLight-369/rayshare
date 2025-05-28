export const Logo = ( { size = 40, className = "" } ) => {
  return (
    <div className={ `inline-flex items-center gap-2 ${ className }` }>
      <div className="relative flex items-center justify-center overflow-hidden" style={ { width: size, height: size } }>
        <svg
          width={ size }
          height={ size }
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transform transition-transform duration-700 hover:rotate-45"
        >
          {/* Base Circle */ }
          <circle cx="50" cy="50" r="45" className="fill-teal-500 dark:fill-teal-600" />

          {/* Inner Circle */ }
          <circle cx="50" cy="50" r="20" className="fill-white dark:fill-slate-900" />

          {/* Rays */ }
          { [ 0, 45, 90, 135, 180, 225, 270, 315 ].map( ( angle, i ) => (
            <rect
              key={ i }
              x="48"
              y="10"
              width="4"
              height="25"
              rx="2"
              className="fill-white dark:fill-slate-900"
              transform={ `rotate(${ angle } 50 50)` }
            />
          ) ) }
        </svg>
      </div>
      <span className="font-bold text-slate-900 dark:text-white text-xl tracking-tight">
        Ray<span className="text-teal-600 dark:text-teal-400">Share</span>
      </span>
    </div>
  );
};
