import styles from "../styles.module.css";
import { useOnboardingContext } from "@/lib/context";
import Link from "next/link";
import Asignatura from "@/models/asignatura";
import EvaluationTest from "@/models/evaluationTest";
import { Dispatch, SetStateAction } from "react";

export default function EvaluationTable({
  fetchingEvaluations,
  evaluationArr,
  setEvaluationDeleteIndex,
  setAssign,
}: {
  fetchingEvaluations: boolean;
  evaluationArr: EvaluationTest[];
  setEvaluationDeleteIndex?: Dispatch<SetStateAction<number | null>>;
  setAssign?: Dispatch<
    SetStateAction<{
      id: string;
      name: string;
    } | null>
  >;
}) {
  const { session } = useOnboardingContext();

  return (
    <div
      id="evaluationList"
      className={`${fetchingEvaluations ? styles.hidden : ""} ${
        styles.tableBox
      }`}
    >
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Dificultad</th>
            <th>Tipo de prueba</th>
            <th>Asignatura</th>
          </tr>
        </thead>
        <tbody id="evaluationList" className={styles.tbody}>
          {fetchingEvaluations ? (
            <>
              <tr className={styles.testItem}>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
              </tr>
              <tr className={styles.testItem}>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
              </tr>
              <tr className={styles.testItem}>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
              </tr>
              <tr className={styles.testItem}>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
              </tr>
              <tr className={styles.testItem}>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
              </tr>
              <tr className={styles.testItem}>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
              </tr>
              <tr className={styles.testItem}>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
              </tr>
              <tr className={styles.testItem}>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
              </tr>
              <tr className={styles.testItem}>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
              </tr>
              <tr className={styles.testItem}>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
              </tr>
              <tr className={styles.testItem}>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
              </tr>
              <tr className={styles.testItem}>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
              </tr>
              <tr className={styles.testItem}>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
              </tr>
              <tr className={styles.testItem}>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
              </tr>
              <tr className={styles.testItem}>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
              </tr>
              <tr className={styles.testItem}>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
              </tr>
              <tr className={styles.testItem}>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
              </tr>
              <tr className={styles.testItem}>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}></td>
              </tr>
            </>
          ) : (
            evaluationArr &&
            evaluationArr.map((item, i) => (
              <tr key={item._id} className={styles.testItem}>
                <td className={styles.td}>
                  <div>
                    {session && session.rol !== "Estudiante" && (
                      <>
                        {" "}
                        <svg
                          className={`${
                            session &&
                            (session.rol === "Admin" ||
                              session.rol === "Directivo")
                              ? ""
                              : session && item.creatorId
                              ? session._id ===
                                (item.creatorId as unknown as any)._id
                                ? ""
                                : styles.disableRol
                              : styles.disableRol
                          }`}
                          onClick={() => {
                            if (setEvaluationDeleteIndex)
                              setEvaluationDeleteIndex(i);
                          }}
                          width="48px"
                          height="48px"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            className={styles.fill}
                            d="M5.29802 12.6172L6.03847 12.7365L5.29802 12.6172ZM6.62639 9.77989L6.75843 9.04161L6.33817 8.96645L6.05898 9.28944L6.62639 9.77989ZM5.26042 12.8505L4.51997 12.7312H4.51997L5.26042 12.8505ZM5.45105 16.0429L4.73 16.2492H4.73L5.45105 16.0429ZM5.5687 16.454L6.28976 16.2477H6.28976L5.5687 16.454ZM10.595 20.8812L10.469 21.6205L10.469 21.6205L10.595 20.8812ZM13.4049 20.8812L13.531 21.6205L13.4049 20.8812ZM18.4313 16.454L17.7102 16.2477V16.2477L18.4313 16.454ZM18.5489 16.0429L19.27 16.2492L18.5489 16.0429ZM18.7396 12.8505L19.48 12.7312V12.7312L18.7396 12.8505ZM18.702 12.6172L17.9615 12.7365L18.702 12.6172ZM17.3736 9.77989L17.941 9.28944L17.6618 8.96645L17.2416 9.04161L17.3736 9.77989ZM17.5112 9.75496L17.3758 9.01728L17.5112 9.75496ZM6.48878 9.75496L6.6242 9.01728L6.48878 9.75496ZM9 5.9125H8.25V6.6625H9V5.9125ZM9.87868 3.85305L10.4011 4.39117V4.39117L9.87868 3.85305ZM10.8519 3.2217L11.1318 3.91755L10.8519 3.2217ZM13.1481 3.2217L12.8682 3.91755L12.8682 3.91755L13.1481 3.2217ZM14.7716 4.79794L15.4615 4.50361V4.50361L14.7716 4.79794ZM15 5.9125V6.6625L15.75 6.6625V5.9125H15ZM10.75 12.7083C10.75 12.2941 10.4142 11.9583 10 11.9583C9.58579 11.9583 9.25 12.2941 9.25 12.7083H10.75ZM9.25 16.5917C9.25 17.0059 9.58579 17.3417 10 17.3417C10.4142 17.3417 10.75 17.0059 10.75 16.5917H9.25ZM14.75 12.7083C14.75 12.2941 14.4142 11.9583 14 11.9583C13.5858 11.9583 13.25 12.2941 13.25 12.7083H14.75ZM13.25 16.5917C13.25 17.0059 13.5858 17.3417 14 17.3417C14.4142 17.3417 14.75 17.0059 14.75 16.5917H13.25ZM6.03847 12.7365C6.18791 11.809 6.59553 10.9625 7.19381 10.2703L6.05898 9.28944C5.28502 10.1848 4.75279 11.2863 4.55757 12.4979L6.03847 12.7365ZM6.00087 12.9698L6.03847 12.7365L4.55757 12.4979L4.51997 12.7312L6.00087 12.9698ZM6.17211 15.8365C5.90508 14.9034 5.84678 13.9262 6.00087 12.9698L4.51997 12.7312C4.33081 13.9052 4.4025 15.1048 4.73 16.2492L6.17211 15.8365ZM6.28976 16.2477L6.17211 15.8365L4.73 16.2492L4.84765 16.6604L6.28976 16.2477ZM10.7211 20.1418C8.58113 19.777 6.86392 18.254 6.28976 16.2477L4.84765 16.6604C5.58591 19.2401 7.78001 21.1621 10.469 21.6205L10.7211 20.1418ZM13.2789 20.1418C12.4328 20.2861 11.5672 20.2861 10.7211 20.1418L10.469 21.6205C11.4819 21.7932 12.518 21.7932 13.531 21.6205L13.2789 20.1418ZM17.7102 16.2477C17.1361 18.254 15.4188 19.777 13.2789 20.1418L13.531 21.6205C16.22 21.1621 18.4141 19.2401 19.1523 16.6604L17.7102 16.2477ZM17.8279 15.8365L17.7102 16.2477L19.1523 16.6604L19.27 16.2492L17.8279 15.8365ZM17.9991 12.9698C18.1532 13.9262 18.0949 14.9034 17.8279 15.8365L19.27 16.2492C19.5975 15.1048 19.6692 13.9052 19.48 12.7312L17.9991 12.9698ZM17.9615 12.7365L17.9991 12.9698L19.48 12.7312L19.4424 12.4979L17.9615 12.7365ZM16.8062 10.2703C17.4045 10.9625 17.8121 11.809 17.9615 12.7365L19.4424 12.4979C19.2472 11.2863 18.715 10.1848 17.941 9.28944L16.8062 10.2703ZM17.2416 9.04161C13.7764 9.6613 10.2236 9.6613 6.75843 9.04161L6.49436 10.5182C10.1342 11.1691 13.8658 11.1691 17.5056 10.5182L17.2416 9.04161ZM7.01045 6.6625H16.9895V5.1625H7.01045V6.6625ZM18.25 7.86432V8.01068H19.75V7.86432H18.25ZM5.75 8.01068V7.86432H4.25V8.01068H5.75ZM17.3758 9.01728C13.8235 9.66941 10.1765 9.66941 6.6242 9.01728L6.35336 10.4926C10.0848 11.1776 13.9152 11.1776 17.6466 10.4926L17.3758 9.01728ZM4.25 8.01068C4.25 9.24128 5.14914 10.2716 6.35336 10.4926L6.6242 9.01728C6.10132 8.9213 5.75 8.48652 5.75 8.01068H4.25ZM18.25 8.01068C18.25 8.48652 17.8987 8.9213 17.3758 9.01728L17.6466 10.4926C18.8509 10.2716 19.75 9.24129 19.75 8.01068H18.25ZM16.9895 6.6625C17.7068 6.6625 18.25 7.22135 18.25 7.86432H19.75C19.75 6.35138 18.493 5.1625 16.9895 5.1625V6.6625ZM7.01045 5.1625C5.50698 5.1625 4.25 6.35138 4.25 7.86432H5.75C5.75 7.22135 6.29324 6.6625 7.01045 6.6625V5.1625ZM8.53853 4.50361C8.34824 4.94959 8.25 5.4284 8.25 5.9125H9.75C9.75 5.63165 9.80695 5.353 9.9182 5.09226L8.53853 4.50361ZM9.35626 3.31493C9.00703 3.65398 8.72878 4.05769 8.53853 4.50361L9.9182 5.09226C10.0295 4.83146 10.1932 4.59303 10.4011 4.39117L9.35626 3.31493ZM10.5721 2.52586C10.1188 2.70816 9.70544 2.97594 9.35626 3.31493L10.4011 4.39117C10.6091 4.18927 10.8572 4.02797 11.1318 3.91755L10.5721 2.52586ZM12 2.25C11.5106 2.25 11.0254 2.34356 10.5721 2.52586L11.1318 3.91755C11.4064 3.80711 11.7015 3.75 12 3.75V2.25ZM13.4279 2.52586C12.9746 2.34356 12.4894 2.25 12 2.25V3.75C12.2985 3.75 12.5936 3.80711 12.8682 3.91755L13.4279 2.52586ZM14.6437 3.31493C14.2946 2.97594 13.8812 2.70816 13.4279 2.52586L12.8682 3.91755C13.1428 4.02797 13.3909 4.18927 13.5989 4.39117L14.6437 3.31493ZM15.4615 4.50361C15.2712 4.05769 14.993 3.65398 14.6437 3.31493L13.5989 4.39117C13.8068 4.59303 13.9705 4.83147 14.0818 5.09226L15.4615 4.50361ZM15.75 5.9125C15.75 5.4284 15.6518 4.9496 15.4615 4.50361L14.0818 5.09226C14.1931 5.353 14.25 5.63165 14.25 5.9125H15.75ZM9 6.6625L15 6.6625V5.1625L9 5.1625V6.6625ZM9.25 12.7083V16.5917H10.75V12.7083H9.25ZM13.25 12.7083V16.5917H14.75V12.7083H13.25Z"
                            fill="var(--primary-red)"
                          />
                        </svg>
                        <a
                          className={`${
                            session &&
                            (session.rol === "Admin" ||
                              session.rol === "Directivo")
                              ? ""
                              : session && item.creatorId
                              ? session._id ===
                                (item.creatorId as unknown as any)._id
                                ? ""
                                : styles.disableRol
                              : styles.disableRol
                          }`}
                          href={`/edit/${item._id}`}
                        >
                          <svg
                            width="48px"
                            height="48px"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              className={styles.stroke}
                              d="M17.25 10.9921C15.129 11.6991 12.3009 8.87105 13.0079 6.75M13.8793 5.87857L9.30971 10.4482C7.3231 12.4348 5.91376 14.924 5.23236 17.6496L5.01156 18.5328C4.94276 18.808 5.19204 19.0572 5.46723 18.9884L6.35044 18.7676C9.07604 18.0862 11.5652 16.6769 13.5518 14.6903L18.1214 10.1207C18.684 9.55813 19 8.79516 19 7.99962C19 6.34297 17.657 5 16.0004 5C15.2048 5 14.4419 5.31603 13.8793 5.87857Z"
                              stroke="var(--primary-light-blue)"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </a>
                        <svg
                          onClick={() => {
                            if (setAssign)
                              setAssign({ id: item._id, name: item.name });
                          }}
                          className="ml-[1px]"
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
                              d="M10.56 11.87C9.81832 11.87 9.0933 11.6501 8.47661 11.238C7.85993 10.826 7.37928 10.2403 7.09545 9.55506C6.81162 8.86984 6.73736 8.11584 6.88205 7.38841C7.02675 6.66098 7.3839 5.99279 7.90835 5.46835C8.4328 4.9439 9.10098 4.58675 9.82841 4.44205C10.5558 4.29736 11.3098 4.37162 11.9951 4.65545C12.6803 4.93928 13.266 5.41992 13.678 6.03661C14.0901 6.65329 14.31 7.37832 14.31 8.12C14.3074 9.11375 13.9114 10.066 13.2087 10.7687C12.506 11.4714 11.5538 11.8674 10.56 11.87ZM10.56 5.87C10.115 5.87 9.67998 6.00196 9.30997 6.24919C8.93996 6.49642 8.65157 6.84783 8.48127 7.25896C8.31097 7.67009 8.26642 8.12249 8.35323 8.55895C8.44005 8.99541 8.65434 9.39632 8.96901 9.71099C9.28368 10.0257 9.68459 10.2399 10.121 10.3268C10.5575 10.4136 11.0099 10.369 11.421 10.1987C11.8322 10.0284 12.1836 9.74004 12.4308 9.37003C12.678 9.00002 12.81 8.565 12.81 8.12C12.81 7.52326 12.5729 6.95096 12.151 6.52901C11.729 6.10705 11.1567 5.87 10.56 5.87Z"
                              fill="var(--primary-light-blue)"
                            ></path>
                            <path
                              d="M3.56 18.87C3.36109 18.87 3.17032 18.791 3.02967 18.6503C2.88902 18.5097 2.81 18.3189 2.81 18.12C2.81 13.37 8.24 13.37 10.56 13.37C11.28 13.37 11.92 13.37 12.5 13.44C12.6973 13.4553 12.8805 13.548 13.0098 13.6979C13.139 13.8477 13.2038 14.0426 13.19 14.24C13.1722 14.4381 13.0773 14.6214 12.9259 14.7504C12.7744 14.8794 12.5785 14.9439 12.38 14.93C11.84 14.93 11.24 14.87 10.56 14.87C5.38 14.87 4.31 16.17 4.31 18.12C4.31134 18.2189 4.29286 18.317 4.25565 18.4086C4.21843 18.5002 4.16324 18.5834 4.09333 18.6533C4.02341 18.7232 3.9402 18.7784 3.84859 18.8156C3.75699 18.8529 3.65886 18.8713 3.56 18.87Z"
                              fill="var(--primary-light-blue)"
                            ></path>
                            <path
                              d="M12.67 19.63C12.4711 19.6299 12.2805 19.5507 12.14 19.41C12.061 19.3348 12.0002 19.2426 11.9621 19.1404C11.9239 19.0382 11.9096 18.9286 11.92 18.82L12.08 16.9C12.0923 16.7235 12.1667 16.557 12.29 16.43L17.81 10.91C18.1908 10.5572 18.6908 10.3612 19.21 10.3612C19.7291 10.3612 20.2291 10.5572 20.61 10.91C20.7978 11.0993 20.9458 11.3242 21.0454 11.5715C21.145 11.8188 21.1942 12.0835 21.19 12.35C21.1939 12.5958 21.149 12.8398 21.0581 13.0681C20.9671 13.2964 20.8318 13.5044 20.66 13.68L15.14 19.2C15.0176 19.3256 14.8545 19.4035 14.68 19.42L12.74 19.6L12.67 19.63ZM13.55 17.29L13.49 18.05L14.27 17.98L19.6 12.65C19.6629 12.5746 19.6951 12.4782 19.69 12.38C19.6896 12.2408 19.64 12.1062 19.55 12C19.4517 11.927 19.3325 11.8875 19.21 11.8875C19.0875 11.8875 18.9683 11.927 18.87 12L13.55 17.29Z"
                              fill="var(--primary-light-blue)"
                            ></path>
                          </g>
                        </svg>
                      </>
                    )}

                    <Link
                      className={styles.evaluationName}
                      href={`/evaluation/${item._id}`}
                    >
                      <p className={styles.name}>
                        {`${item.name}`}
                        <span className={styles.creatorName}>
                          {item.creatorId
                            ? ` por ${
                                (item.creatorId as unknown as any).nombre || ""
                              } ${
                                (item.creatorId as unknown as any).apellido ||
                                ""
                              }`
                            : ""}
                        </span>
                      </p>
                    </Link>
                  </div>
                </td>
                <td className={styles.td}>
                  <div>
                    <p>
                      {item.difficulty.charAt(0).toUpperCase() +
                        item.difficulty.slice(1)}
                    </p>
                  </div>
                </td>
                <td className={styles.td}>
                  <div>
                    <p>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </p>
                  </div>
                </td>
                <td className={styles.td}>
                  <div>
                    <p>
                      {item.asignatura && (item.asignatura as Asignatura).name
                        ? (item.asignatura as Asignatura).name
                        : "N/A"}
                    </p>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {fetchingEvaluations ? (
        <div className={styles.overlay}>
          <div className={styles.loader}></div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
