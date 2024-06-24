import styles from "@/components/management/styles.module.css";
import SearchInput from "@/components/management/searchInput/searchInput";
import User from "@/models/user";
import Curso from "@/models/curso";
import { Dispatch, SetStateAction } from "react";
import { CursoWrap } from "@/components/management/management";

export default function Stats({
  setInputSearch,
  inputSearch,
  setKeyword,
  deleteUsers,
  fetchingUsers,
  usersArr,
  pageSelected,
  pageArr,
  setPageSelected,
  filterCursoInput,
  setFilterCursoInput,
  cursosArr,
}: {
  setInputSearch: Dispatch<SetStateAction<string>>;
  setKeyword: (arg0: string) => void;
  setFilterRolInput: (arg0: string) => void;
  setFilterReviewInput: Dispatch<SetStateAction<boolean>>;
  inputSearch: string;
  filterRolInput: string;
  filterReviewInput: boolean;
  deleteUsers: string[] | null;
  setDeleteUsers: Dispatch<SetStateAction<string[] | null>>;
  setDeleteUsersConfirm: () => void;
  passwordShowArr: boolean[];
  setPasswordShowArr: (arg0: boolean[]) => void;
  fetchingUsers: boolean;
  usersArr: User[];
  pageSelected: number;
  setUserDeleteIndex: (arg0: number) => void;
  setPageSelected: (arg0: number) => void;
  pageArr: number[];
  setUserSelected: Dispatch<SetStateAction<User | null | string>>;
  filterCursoInput: string;
  setFilterCursoInput: Dispatch<SetStateAction<string>>;
  cursosArr: CursoWrap[];
}) {
  return (
    <>
      <div className={styles.top}>
        <div className={styles.filterBox}>
          <SearchInput
            setInput={setInputSearch}
            input={inputSearch}
            action={() => {
              setKeyword(inputSearch);
            }}
          />

          <p>Curso:</p>
          <select
            onChange={(e) => setFilterCursoInput(e.target.value)}
            name="cursoFilter"
            id="cursoFilter"
            value={filterCursoInput}
          >
            <option value="Todos">Todos</option>
            {cursosArr.map((curso) => (
              <option key={curso._id} value={curso._id}>
                {curso.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div
        id="usersList"
        className={`${fetchingUsers ? styles.hidden : ""} ${styles.tableBox}`}
      >
        <table>
          <thead>
            <tr className={styles.tableHead}>
              <th className={styles.tableHeadName}>Nombre</th>
              <th className={styles.tableHeadName}>RUT</th>
              <th className={styles.tableHeadName}>Curso</th>
            </tr>
          </thead>
          <tbody
            id="usersList"
            className={`${styles.usersList} ${
              fetchingUsers ? styles.hidden : ""
            }`}
          >
            {fetchingUsers && usersArr ? (
              <>
                {Array.from({ length: 15 }, (_, index) => (
                  <tr key={index} className={styles.userItem}>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                ))}
              </>
            ) : (
              usersArr.map((user: User, index) => {
                return (
                  <tr
                    className={`${
                      deleteUsers?.includes(user._id)
                        ? `${styles.itemSelectedOverlay} ${styles.select}`
                        : user.review
                        ? `${styles.itemSelectedOverlay} ${styles.wrong}`
                        : ""
                    }  ${styles.userItem} ${
                      deleteUsers ? "cursor-pointer" : ""
                    }`}
                    key={user._id}
                  >
                    <td className={styles.tableItem}>
                      <p className={styles.name}>
                        <span>{25 * (pageSelected - 1) + index + 1}</span>
                        {`${user.nombre} ${user.apellido}`}
                      </p>
                    </td>
                    <td className={styles.tableItem}>
                      <p className={styles.name}>{`${user.dni}`}</p>
                    </td>
                    <td className={styles.tableItem}>
                      <p className={styles.name}>
                        {Array.isArray(user.curso) && user.curso.length > 0
                          ? user.curso
                              .map((curso) => {
                                if ((curso as Curso).name)
                                  return (curso as Curso).name;
                              })
                              .join(" | ")
                          : "N/A"}
                      </p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {fetchingUsers ? (
          <div className={styles.overlay}>
            <div className={styles.loader}></div>
          </div>
        ) : (
          ""
        )}
      </div>
      <div className={styles.pageBox}>
        {pageArr.map((page) => (
          <div
            onClick={() => {
              if (pageSelected !== page) {
                setPageSelected(page);
              }
            }}
            className={`${styles.page} ${
              pageSelected === page ? styles.selected : ""
            }`}
            key={page}
          >
            {page}
          </div>
        ))}
      </div>
    </>
  );
}
