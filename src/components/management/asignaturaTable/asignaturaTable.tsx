import { Dispatch, SetStateAction } from "react";
import styles from "../styles.module.css";
import SearchInput from "@/components/management/searchInput/searchInput";
import Asignatura from "@/models/asignatura";
import { AsignaturaWrap } from "@/components/management/management";

export default function AsignaturaTable({
  setKeywordAsignaturas,
  keywordAsignaturas,
  fetchingAsignaturas,
  addAsignatura,
  asignaturaInput,
  setAsignaturaInput,
  asignaturasArr,
  setAsignaturaDeleteIndex,
  handleAsignaturaEdit,
  editAsignatura,
}: {
  setKeywordAsignaturas: Dispatch<SetStateAction<string>>;
  keywordAsignaturas: string;
  fetchingAsignaturas: boolean;
  addAsignatura: () => void;
  asignaturaInput: string;
  setAsignaturaInput: Dispatch<SetStateAction<string>>;
  asignaturasArr: AsignaturaWrap[];
  setAsignaturaDeleteIndex: Dispatch<SetStateAction<Asignatura | null>>;
  handleAsignaturaEdit: (index: number) => void;
  editAsignatura: (id: string, newName: string) => Promise<void>;
}) {
  return (
    <>
      <div className={`${styles.curso} ${styles.top}`}>
        <div className={styles.filterBox}>
          <SearchInput
            setInput={setKeywordAsignaturas}
            input={keywordAsignaturas}
          />
        </div>
      </div>
      <div id="wrapBoxAsignatura" className={styles.wrapBox}>
        {fetchingAsignaturas ? (
          <li className={styles.overlay}>
            <div className={styles.loader}></div>
          </li>
        ) : (
          ""
        )}
        <div className={styles.wrapItem}>
          <input
            onKeyDown={(e) => {
              if (e.key === "Enter") addAsignatura();
            }}
            type="text"
            value={asignaturaInput}
            onChange={(e) => setAsignaturaInput(e.target.value)}
            placeholder="Crear Asignatura"
          ></input>
          <svg
            onClick={addAsignatura}
            width="48px"
            height="48px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.35288 8.95043C4.00437 6.17301 6.17301 4.00437 8.95043 3.35288C10.9563 2.88237 13.0437 2.88237 15.0496 3.35288C17.827 4.00437 19.9956 6.17301 20.6471 8.95044C21.1176 10.9563 21.1176 13.0437 20.6471 15.0496C19.9956 17.827 17.827 19.9956 15.0496 20.6471C13.0437 21.1176 10.9563 21.1176 8.95044 20.6471C6.17301 19.9956 4.00437 17.827 3.35288 15.0496C2.88237 13.0437 2.88237 10.9563 3.35288 8.95043Z"
              stroke="var(--primary-light-blue)"
              strokeWidth="1.5"
            />
            <path
              d="M14.5 12H9.5M12 14.5L12 9.5"
              stroke="var(--primary-light-blue)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        {asignaturasArr
          .filter((asignatura) =>
            asignatura.name
              .toLowerCase()
              .includes(keywordAsignaturas.toLowerCase())
          )
          .map((asignatura, i) => {
            return (
              <div
                key={asignatura._id || i}
                className={`${styles.wrapItem} ${
                  asignatura.edit ? styles.editingItem : ""
                }`}
              >
                {!asignatura.edit ? (
                  <>
                    <p>{asignatura.name}</p>
                    <div className={styles.cursoOptionBox}>
                      <svg
                        onClick={() => {
                          if (asignatura._id)
                            setAsignaturaDeleteIndex(asignatura);
                        }}
                        width="32px"
                        height="32px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5.29802 12.6172L6.03847 12.7365L5.29802 12.6172ZM6.62639 9.77989L6.75843 9.04161L6.33817 8.96645L6.05898 9.28944L6.62639 9.77989ZM5.26042 12.8505L4.51997 12.7312H4.51997L5.26042 12.8505ZM5.45105 16.0429L4.73 16.2492H4.73L5.45105 16.0429ZM5.5687 16.454L6.28976 16.2477H6.28976L5.5687 16.454ZM10.595 20.8812L10.469 21.6205L10.469 21.6205L10.595 20.8812ZM13.4049 20.8812L13.531 21.6205L13.4049 20.8812ZM18.4313 16.454L17.7102 16.2477V16.2477L18.4313 16.454ZM18.5489 16.0429L19.27 16.2492L18.5489 16.0429ZM18.7396 12.8505L19.48 12.7312V12.7312L18.7396 12.8505ZM18.702 12.6172L17.9615 12.7365L18.702 12.6172ZM17.3736 9.77989L17.941 9.28944L17.6618 8.96645L17.2416 9.04161L17.3736 9.77989ZM17.5112 9.75496L17.3758 9.01728L17.5112 9.75496ZM6.48878 9.75496L6.6242 9.01728L6.48878 9.75496ZM9 5.9125H8.25V6.6625H9V5.9125ZM9.87868 3.85305L10.4011 4.39117V4.39117L9.87868 3.85305ZM10.8519 3.2217L11.1318 3.91755L10.8519 3.2217ZM13.1481 3.2217L12.8682 3.91755L12.8682 3.91755L13.1481 3.2217ZM14.7716 4.79794L15.4615 4.50361V4.50361L14.7716 4.79794ZM15 5.9125V6.6625L15.75 6.6625V5.9125H15ZM10.75 12.7083C10.75 12.2941 10.4142 11.9583 10 11.9583C9.58579 11.9583 9.25 12.2941 9.25 12.7083H10.75ZM9.25 16.5917C9.25 17.0059 9.58579 17.3417 10 17.3417C10.4142 17.3417 10.75 17.0059 10.75 16.5917H9.25ZM14.75 12.7083C14.75 12.2941 14.4142 11.9583 14 11.9583C13.5858 11.9583 13.25 12.2941 13.25 12.7083H14.75ZM13.25 16.5917C13.25 17.0059 13.5858 17.3417 14 17.3417C14.4142 17.3417 14.75 17.0059 14.75 16.5917H13.25ZM6.03847 12.7365C6.18791 11.809 6.59553 10.9625 7.19381 10.2703L6.05898 9.28944C5.28502 10.1848 4.75279 11.2863 4.55757 12.4979L6.03847 12.7365ZM6.00087 12.9698L6.03847 12.7365L4.55757 12.4979L4.51997 12.7312L6.00087 12.9698ZM6.17211 15.8365C5.90508 14.9034 5.84678 13.9262 6.00087 12.9698L4.51997 12.7312C4.33081 13.9052 4.4025 15.1048 4.73 16.2492L6.17211 15.8365ZM6.28976 16.2477L6.17211 15.8365L4.73 16.2492L4.84765 16.6604L6.28976 16.2477ZM10.7211 20.1418C8.58113 19.777 6.86392 18.254 6.28976 16.2477L4.84765 16.6604C5.58591 19.2401 7.78001 21.1621 10.469 21.6205L10.7211 20.1418ZM13.2789 20.1418C12.4328 20.2861 11.5672 20.2861 10.7211 20.1418L10.469 21.6205C11.4819 21.7932 12.518 21.7932 13.531 21.6205L13.2789 20.1418ZM17.7102 16.2477C17.1361 18.254 15.4188 19.777 13.2789 20.1418L13.531 21.6205C16.22 21.1621 18.4141 19.2401 19.1523 16.6604L17.7102 16.2477ZM17.8279 15.8365L17.7102 16.2477L19.1523 16.6604L19.27 16.2492L17.8279 15.8365ZM17.9991 12.9698C18.1532 13.9262 18.0949 14.9034 17.8279 15.8365L19.27 16.2492C19.5975 15.1048 19.6692 13.9052 19.48 12.7312L17.9991 12.9698ZM17.9615 12.7365L17.9991 12.9698L19.48 12.7312L19.4424 12.4979L17.9615 12.7365ZM16.8062 10.2703C17.4045 10.9625 17.8121 11.809 17.9615 12.7365L19.4424 12.4979C19.2472 11.2863 18.715 10.1848 17.941 9.28944L16.8062 10.2703ZM17.2416 9.04161C13.7764 9.6613 10.2236 9.6613 6.75843 9.04161L6.49436 10.5182C10.1342 11.1691 13.8658 11.1691 17.5056 10.5182L17.2416 9.04161ZM7.01045 6.6625H16.9895V5.1625H7.01045V6.6625ZM18.25 7.86432V8.01068H19.75V7.86432H18.25ZM5.75 8.01068V7.86432H4.25V8.01068H5.75ZM17.3758 9.01728C13.8235 9.66941 10.1765 9.66941 6.6242 9.01728L6.35336 10.4926C10.0848 11.1776 13.9152 11.1776 17.6466 10.4926L17.3758 9.01728ZM4.25 8.01068C4.25 9.24128 5.14914 10.2716 6.35336 10.4926L6.6242 9.01728C6.10132 8.9213 5.75 8.48652 5.75 8.01068H4.25ZM18.25 8.01068C18.25 8.48652 17.8987 8.9213 17.3758 9.01728L17.6466 10.4926C18.8509 10.2716 19.75 9.24129 19.75 8.01068H18.25ZM16.9895 6.6625C17.7068 6.6625 18.25 7.22135 18.25 7.86432H19.75C19.75 6.35138 18.493 5.1625 16.9895 5.1625V6.6625ZM7.01045 5.1625C5.50698 5.1625 4.25 6.35138 4.25 7.86432H5.75C5.75 7.22135 6.29324 6.6625 7.01045 6.6625V5.1625ZM8.53853 4.50361C8.34824 4.94959 8.25 5.4284 8.25 5.9125H9.75C9.75 5.63165 9.80695 5.353 9.9182 5.09226L8.53853 4.50361ZM9.35626 3.31493C9.00703 3.65398 8.72878 4.05769 8.53853 4.50361L9.9182 5.09226C10.0295 4.83146 10.1932 4.59303 10.4011 4.39117L9.35626 3.31493ZM10.5721 2.52586C10.1188 2.70816 9.70544 2.97594 9.35626 3.31493L10.4011 4.39117C10.6091 4.18927 10.8572 4.02797 11.1318 3.91755L10.5721 2.52586ZM12 2.25C11.5106 2.25 11.0254 2.34356 10.5721 2.52586L11.1318 3.91755C11.4064 3.80711 11.7015 3.75 12 3.75V2.25ZM13.4279 2.52586C12.9746 2.34356 12.4894 2.25 12 2.25V3.75C12.2985 3.75 12.5936 3.80711 12.8682 3.91755L13.4279 2.52586ZM14.6437 3.31493C14.2946 2.97594 13.8812 2.70816 13.4279 2.52586L12.8682 3.91755C13.1428 4.02797 13.3909 4.18927 13.5989 4.39117L14.6437 3.31493ZM15.4615 4.50361C15.2712 4.05769 14.993 3.65398 14.6437 3.31493L13.5989 4.39117C13.8068 4.59303 13.9705 4.83147 14.0818 5.09226L15.4615 4.50361ZM15.75 5.9125C15.75 5.4284 15.6518 4.9496 15.4615 4.50361L14.0818 5.09226C14.1931 5.353 14.25 5.63165 14.25 5.9125H15.75ZM9 6.6625L15 6.6625V5.1625L9 5.1625V6.6625ZM9.25 12.7083V16.5917H10.75V12.7083H9.25ZM13.25 12.7083V16.5917H14.75V12.7083H13.25Z"
                          fill="var(--primary-red)"
                        />
                      </svg>
                      <svg
                        onClick={() => handleAsignaturaEdit(i)}
                        width="32px"
                        height="32px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17.25 10.9921C15.129 11.6991 12.3009 8.87105 13.0079 6.75M13.8793 5.87857L9.30971 10.4482C7.3231 12.4348 5.91376 14.924 5.23236 17.6496L5.01156 18.5328C4.94276 18.808 5.19204 19.0572 5.46723 18.9884L6.35044 18.7676C9.07604 18.0862 11.5652 16.6769 13.5518 14.6903L18.1214 10.1207C18.684 9.55813 19 8.79516 19 7.99962C19 6.34297 17.657 5 16.0004 5C15.2048 5 14.4419 5.31603 13.8793 5.87857Z"
                          stroke="var(--primary-light-blue)"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>
                  </>
                ) : (
                  <input
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && asignatura._id) {
                        const inputElmt = (
                          document.getElementById(
                            asignatura._id
                          ) as HTMLInputElement
                        ).value;

                        editAsignatura(asignatura._id, inputElmt);
                      } else if (e.key === "Escape") handleAsignaturaEdit(i);
                    }}
                    type="text"
                    placeholder="Asignatura"
                    defaultValue={asignatura.name}
                    id={asignatura._id || asignatura.name}
                  ></input>
                )}
              </div>
            );
          })}
      </div>
    </>
  );
}
