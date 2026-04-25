export function InkWash() {
  return (
    <svg
      aria-hidden="true"
      className="animate-ink-spread absolute right-[-18%] top-16 h-[88vh] w-[58vw] min-w-[520px] text-devil-red/35 opacity-20 blur-[0.2px]"
      fill="none"
      viewBox="0 0 620 920"
    >
      <filter id="ink-blur">
        <feGaussianBlur stdDeviation="10" />
      </filter>
      <path
        d="M406 16c42 92-32 155-14 235 19 83 105 132 81 225-23 90-132 84-162 180-24 75 28 131-27 204-48 63-161 41-202-12-46-59 2-126 43-183 57-78 68-124 24-217-39-83-106-157-67-248C123 104 265 118 317 44c24-34 62-58 89-28Z"
        fill="currentColor"
        filter="url(#ink-blur)"
      />
      <path
        d="M484 145c23 37 13 79-21 94-36 16-84-5-90-43-7-45 39-86 83-70 11 4 20 10 28 19Z"
        fill="#B8860B"
        opacity="0.22"
      />
      <path
        d="M285 316c-66 51-19 122-67 179-38 45-103 13-142 62-38 49-11 141 51 169"
        stroke="#E8E6E3"
        strokeOpacity="0.08"
        strokeWidth="2"
      />
    </svg>
  );
}
