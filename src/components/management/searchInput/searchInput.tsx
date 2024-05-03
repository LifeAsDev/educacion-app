import styles from "./styles.module.css";
export default function SearchInput({
  input,
  setInput,
  action,
}: {
  input: string;
  setInput: (arg0: string) => void;
  action?: () => void;
}) {
  return (
    <div className={styles.searchBox}>
      <input
        type="text"
        onKeyDown={(e) => {
          if (e.key === "Enter") action!();
        }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        spellCheck="false"
      ></input>
      <svg
        onClick={action}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <path
            opacity="0"
            d="M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
            fill="white"
          ></path>
          <path
            d="M15 15L21 21"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
            stroke="white"
            strokeWidth="2"
          ></path>
        </g>
      </svg>
    </div>
  );
}
