import styles from "../styles.module.css";
import SearchInput from "@/components/management/searchInput/searchInput";
import User from "@/models/user";
import Curso from "@/models/curso";
import { Dispatch, SetStateAction, useState } from "react";
import { CursoWrap } from "@/components/management/management";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import UserSortableItem from "./userSortableItem/userSortableItem";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";

export default function UsersTable({
  setInputSearch,
  inputSearch,
  setKeyword,
  setFilterRolInput,
  filterRolInput,
  setFilterReviewInput,
  filterReviewInput,
  deleteUsers,
  setDeleteUsers,
  setDeleteUsersConfirm,
  passwordShowArr,
  setPasswordShowArr,
  fetchingUsers,
  usersArr,
  pageSelected,
  setUserDeleteIndex,
  pageArr,
  setPageSelected,
  setUserSelected,
  filterCursoInput,
  setFilterCursoInput,
  cursosArr,
  setUsersArr,
  disableDrag,
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
  setUsersArr: Dispatch<SetStateAction<User[]>>;
  pageSelected: number;
  setUserDeleteIndex: (arg0: number) => void;
  setPageSelected: (arg0: number) => void;
  pageArr: number[];
  setUserSelected: Dispatch<SetStateAction<User | null | string>>;
  filterCursoInput: string;
  setFilterCursoInput: Dispatch<SetStateAction<string>>;
  cursosArr: CursoWrap[];
  disableDrag: boolean;
}) {
  const [activeUser, setActiveUser] = useState<null | User>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const getUserIndex = (id: string) =>
    usersArr.findIndex((user) => user._id === id);

  const handleDragEnd = (event: { active: any; over: any }) => {
    setActiveUser(null);
    const { active, over } = event;

    if (active.id === over.id) return;

    setUsersArr((users) => {
      const originalPos = getUserIndex(active.id);
      const newPos = getUserIndex(over.id);
      const newUsersArr = arrayMove(users, originalPos, newPos);
      setUsersOrder(
        newUsersArr.map((user) => {
          return user._id;
        })
      );

      return newUsersArr;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveUser(usersArr[getUserIndex(event.active.id as string)]);
  };

  const setUsersOrder = (users: string[]) => {
    const fetchOrderUsers = async () => {
      try {
        const searchParams = new URLSearchParams();
        const data = new FormData();
        users?.forEach((user) => {
          data.append("users", user);
        });

        const res = await fetch(`/api/user?${searchParams}`, {
          method: "PATCH",
          body: data,
        });

        const resData = await res.json();
      } catch (error) {
        // Handle error
      }
    };
    fetchOrderUsers();
  };
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
          <p>Rol:</p>
          <select
            onChange={(e) => setFilterRolInput(e.target.value)}
            name="rol"
            id="rol"
            value={filterRolInput}
          >
            <option value="Todos">Todos</option>
            <option value="Admin">Admin</option>
            <option value="Directivo">Directivo</option>
            <option value="Profesor">Profesor</option>
            <option value="Estudiante">Estudiante</option>
          </select>
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
          <label className={styles.rolBox} htmlFor="inReview">
            <p>En revisión</p>
            <input
              onChange={(e) => setFilterReviewInput((prev: boolean) => !prev)}
              type="checkbox"
              id="inReview"
              name="inReview"
              checked={filterReviewInput}
            />
            <span className={styles.checkmarkRadio}></span>
          </label>
          {deleteUsers ? (
            <div className={styles.deleteSomeBox}>
              <p>{deleteUsers.length} elementos seleccionados</p>
              <label
                onClick={() => setDeleteUsers(null)}
                className={`${styles.optionDeleteSome} ${styles.btn}`}
              >
                <svg
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
                      d="M6 6L18 18M18 6L6 18"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </g>
                </svg>
              </label>
              <label
                onClick={setDeleteUsersConfirm}
                className={`${styles.optionDeleteSome} ${styles.btn}`}
              >
                <svg
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
                      d="M4 12.6111L8.92308 17.5L20 6.5"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </g>
                </svg>
              </label>
            </div>
          ) : (
            <label
              onClick={() => {
                setDeleteUsers([]);
              }}
              className={`${styles.deleteSomeUsers} ${styles.btn}`}
            >
              <span>Borrar varios</span>
              <svg
                width="32px"
                height="32px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.29802 12.6172L6.03847 12.7365L5.29802 12.6172ZM6.62639 9.77989L6.75843 9.04161L6.33817 8.96645L6.05898 9.28944L6.62639 9.77989ZM5.26042 12.8505L4.51997 12.7312H4.51997L5.26042 12.8505ZM5.45105 16.0429L4.73 16.2492H4.73L5.45105 16.0429ZM5.5687 16.454L6.28976 16.2477H6.28976L5.5687 16.454ZM10.595 20.8812L10.469 21.6205L10.469 21.6205L10.595 20.8812ZM13.4049 20.8812L13.531 21.6205L13.4049 20.8812ZM18.4313 16.454L17.7102 16.2477V16.2477L18.4313 16.454ZM18.5489 16.0429L19.27 16.2492L18.5489 16.0429ZM18.7396 12.8505L19.48 12.7312V12.7312L18.7396 12.8505ZM18.702 12.6172L17.9615 12.7365L18.702 12.6172ZM17.3736 9.77989L17.941 9.28944L17.6618 8.96645L17.2416 9.04161L17.3736 9.77989ZM17.5112 9.75496L17.3758 9.01728L17.5112 9.75496ZM6.48878 9.75496L6.6242 9.01728L6.48878 9.75496ZM9 5.9125H8.25V6.6625H9V5.9125ZM9.87868 3.85305L10.4011 4.39117V4.39117L9.87868 3.85305ZM10.8519 3.2217L11.1318 3.91755L10.8519 3.2217ZM13.1481 3.2217L12.8682 3.91755L12.8682 3.91755L13.1481 3.2217ZM14.7716 4.79794L15.4615 4.50361V4.50361L14.7716 4.79794ZM15 5.9125V6.6625L15.75 6.6625V5.9125H15ZM10.75 12.7083C10.75 12.2941 10.4142 11.9583 10 11.9583C9.58579 11.9583 9.25 12.2941 9.25 12.7083H10.75ZM9.25 16.5917C9.25 17.0059 9.58579 17.3417 10 17.3417C10.4142 17.3417 10.75 17.0059 10.75 16.5917H9.25ZM14.75 12.7083C14.75 12.2941 14.4142 11.9583 14 11.9583C13.5858 11.9583 13.25 12.2941 13.25 12.7083H14.75ZM13.25 16.5917C13.25 17.0059 13.5858 17.3417 14 17.3417C14.4142 17.3417 14.75 17.0059 14.75 16.5917H13.25ZM6.03847 12.7365C6.18791 11.809 6.59553 10.9625 7.19381 10.2703L6.05898 9.28944C5.28502 10.1848 4.75279 11.2863 4.55757 12.4979L6.03847 12.7365ZM6.00087 12.9698L6.03847 12.7365L4.55757 12.4979L4.51997 12.7312L6.00087 12.9698ZM6.17211 15.8365C5.90508 14.9034 5.84678 13.9262 6.00087 12.9698L4.51997 12.7312C4.33081 13.9052 4.4025 15.1048 4.73 16.2492L6.17211 15.8365ZM6.28976 16.2477L6.17211 15.8365L4.73 16.2492L4.84765 16.6604L6.28976 16.2477ZM10.7211 20.1418C8.58113 19.777 6.86392 18.254 6.28976 16.2477L4.84765 16.6604C5.58591 19.2401 7.78001 21.1621 10.469 21.6205L10.7211 20.1418ZM13.2789 20.1418C12.4328 20.2861 11.5672 20.2861 10.7211 20.1418L10.469 21.6205C11.4819 21.7932 12.518 21.7932 13.531 21.6205L13.2789 20.1418ZM17.7102 16.2477C17.1361 18.254 15.4188 19.777 13.2789 20.1418L13.531 21.6205C16.22 21.1621 18.4141 19.2401 19.1523 16.6604L17.7102 16.2477ZM17.8279 15.8365L17.7102 16.2477L19.1523 16.6604L19.27 16.2492L17.8279 15.8365ZM17.9991 12.9698C18.1532 13.9262 18.0949 14.9034 17.8279 15.8365L19.27 16.2492C19.5975 15.1048 19.6692 13.9052 19.48 12.7312L17.9991 12.9698ZM17.9615 12.7365L17.9991 12.9698L19.48 12.7312L19.4424 12.4979L17.9615 12.7365ZM16.8062 10.2703C17.4045 10.9625 17.8121 11.809 17.9615 12.7365L19.4424 12.4979C19.2472 11.2863 18.715 10.1848 17.941 9.28944L16.8062 10.2703ZM17.2416 9.04161C13.7764 9.6613 10.2236 9.6613 6.75843 9.04161L6.49436 10.5182C10.1342 11.1691 13.8658 11.1691 17.5056 10.5182L17.2416 9.04161ZM7.01045 6.6625H16.9895V5.1625H7.01045V6.6625ZM18.25 7.86432V8.01068H19.75V7.86432H18.25ZM5.75 8.01068V7.86432H4.25V8.01068H5.75ZM17.3758 9.01728C13.8235 9.66941 10.1765 9.66941 6.6242 9.01728L6.35336 10.4926C10.0848 11.1776 13.9152 11.1776 17.6466 10.4926L17.3758 9.01728ZM4.25 8.01068C4.25 9.24128 5.14914 10.2716 6.35336 10.4926L6.6242 9.01728C6.10132 8.9213 5.75 8.48652 5.75 8.01068H4.25ZM18.25 8.01068C18.25 8.48652 17.8987 8.9213 17.3758 9.01728L17.6466 10.4926C18.8509 10.2716 19.75 9.24129 19.75 8.01068H18.25ZM16.9895 6.6625C17.7068 6.6625 18.25 7.22135 18.25 7.86432H19.75C19.75 6.35138 18.493 5.1625 16.9895 5.1625V6.6625ZM7.01045 5.1625C5.50698 5.1625 4.25 6.35138 4.25 7.86432H5.75C5.75 7.22135 6.29324 6.6625 7.01045 6.6625V5.1625ZM8.53853 4.50361C8.34824 4.94959 8.25 5.4284 8.25 5.9125H9.75C9.75 5.63165 9.80695 5.353 9.9182 5.09226L8.53853 4.50361ZM9.35626 3.31493C9.00703 3.65398 8.72878 4.05769 8.53853 4.50361L9.9182 5.09226C10.0295 4.83146 10.1932 4.59303 10.4011 4.39117L9.35626 3.31493ZM10.5721 2.52586C10.1188 2.70816 9.70544 2.97594 9.35626 3.31493L10.4011 4.39117C10.6091 4.18927 10.8572 4.02797 11.1318 3.91755L10.5721 2.52586ZM12 2.25C11.5106 2.25 11.0254 2.34356 10.5721 2.52586L11.1318 3.91755C11.4064 3.80711 11.7015 3.75 12 3.75V2.25ZM13.4279 2.52586C12.9746 2.34356 12.4894 2.25 12 2.25V3.75C12.2985 3.75 12.5936 3.80711 12.8682 3.91755L13.4279 2.52586ZM14.6437 3.31493C14.2946 2.97594 13.8812 2.70816 13.4279 2.52586L12.8682 3.91755C13.1428 4.02797 13.3909 4.18927 13.5989 4.39117L14.6437 3.31493ZM15.4615 4.50361C15.2712 4.05769 14.993 3.65398 14.6437 3.31493L13.5989 4.39117C13.8068 4.59303 13.9705 4.83147 14.0818 5.09226L15.4615 4.50361ZM15.75 5.9125C15.75 5.4284 15.6518 4.9496 15.4615 4.50361L14.0818 5.09226C14.1931 5.353 14.25 5.63165 14.25 5.9125H15.75ZM9 6.6625L15 6.6625V5.1625L9 5.1625V6.6625ZM9.25 12.7083V16.5917H10.75V12.7083H9.25ZM13.25 12.7083V16.5917H14.75V12.7083H13.25Z"
                  fill="var(--white)"
                />
              </svg>
            </label>
          )}
          <label
            className={`${styles.upload} ${styles.btn}`}
            htmlFor="excelFileInput"
          >
            <span>Cargar Usuarios</span>
            <svg
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
                  d="M12.5535 2.49392C12.4114 2.33852 12.2106 2.25 12 2.25C11.7894 2.25 11.5886 2.33852 11.4465 2.49392L7.44648 6.86892C7.16698 7.17462 7.18822 7.64902 7.49392 7.92852C7.79963 8.20802 8.27402 8.18678 8.55352 7.88108L11.25 4.9318V16C11.25 16.4142 11.5858 16.75 12 16.75C12.4142 16.75 12.75 16.4142 12.75 16V4.9318L15.4465 7.88108C15.726 8.18678 16.2004 8.20802 16.5061 7.92852C16.8118 7.64902 16.833 7.17462 16.5535 6.86892L12.5535 2.49392Z"
                  fill="#ffffff"
                ></path>
                <path
                  d="M3.75 15C3.75 14.5858 3.41422 14.25 3 14.25C2.58579 14.25 2.25 14.5858 2.25 15V15.0549C2.24998 16.4225 2.24996 17.5248 2.36652 18.3918C2.48754 19.2919 2.74643 20.0497 3.34835 20.6516C3.95027 21.2536 4.70814 21.5125 5.60825 21.6335C6.47522 21.75 7.57754 21.75 8.94513 21.75H15.0549C16.4225 21.75 17.5248 21.75 18.3918 21.6335C19.2919 21.5125 20.0497 21.2536 20.6517 20.6516C21.2536 20.0497 21.5125 19.2919 21.6335 18.3918C21.75 17.5248 21.75 16.4225 21.75 15.0549V15C21.75 14.5858 21.4142 14.25 21 14.25C20.5858 14.25 20.25 14.5858 20.25 15C20.25 16.4354 20.2484 17.4365 20.1469 18.1919C20.0482 18.9257 19.8678 19.3142 19.591 19.591C19.3142 19.8678 18.9257 20.0482 18.1919 20.1469C17.4365 20.2484 16.4354 20.25 15 20.25H9C7.56459 20.25 6.56347 20.2484 5.80812 20.1469C5.07435 20.0482 4.68577 19.8678 4.40901 19.591C4.13225 19.3142 3.9518 18.9257 3.85315 18.1919C3.75159 17.4365 3.75 16.4354 3.75 15Z"
                  fill="#ffffff"
                ></path>
              </g>
            </svg>
          </label>
          <label
            onClick={() => {
              setUserSelected("Create");
            }}
            className={`${styles.add} ${styles.btn}`}
          >
            <span>Agregar Usuario</span>
            <svg width="48px" height="48px" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 12H16M12 8L12 16"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </label>
        </div>
      </div>
      <div
        id="usersList"
        className={`${fetchingUsers ? styles.hidden : ""} ${styles.tableBox}`}
      >
        <DndContext
          onDragEnd={handleDragEnd}
          collisionDetection={closestCorners}
          sensors={sensors}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={handleDragStart}
        >
          <SortableContext
            items={usersArr.map((user) => {
              return {
                id: user._id,
              };
            })}
            strategy={verticalListSortingStrategy}
            disabled={disableDrag}
          >
            <table>
              <thead>
                <tr className={styles.tableHead}>
                  <th className={styles.tableHeadName}>Nombre</th>
                  <th className={styles.tableHeadName}>Rol</th>
                  <th className={styles.tableHeadName}>RUT</th>
                  <th className={styles.tableHeadName}>Curso</th>
                  <th className={styles.tableHeadName}>Asignatura</th>
                  <th
                    onClick={() => {
                      let newPasswordShowArr = [...passwordShowArr];
                      if (passwordShowArr.includes(true))
                        newPasswordShowArr = newPasswordShowArr.map(
                          (passwordShow) => {
                            return false;
                          }
                        );
                      else
                        newPasswordShowArr = newPasswordShowArr.map(
                          (passwordShow) => {
                            return true;
                          }
                        );
                      setPasswordShowArr(newPasswordShowArr);
                    }}
                    className={styles.tableHeadName}
                  >
                    <div>
                      {!passwordShowArr.includes(true) ? (
                        <svg
                          className={styles.seePassword}
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
                            <g id="Edit / Show">
                              <g id="Vector">
                                <path
                                  d="M3.5868 13.7788C5.36623 15.5478 8.46953 17.9999 12.0002 17.9999C15.5308 17.9999 18.6335 15.5478 20.413 13.7788C20.8823 13.3123 21.1177 13.0782 21.2671 12.6201C21.3738 12.2933 21.3738 11.7067 21.2671 11.3799C21.1177 10.9218 20.8823 10.6877 20.413 10.2211C18.6335 8.45208 15.5308 6 12.0002 6C8.46953 6 5.36623 8.45208 3.5868 10.2211C3.11714 10.688 2.88229 10.9216 2.7328 11.3799C2.62618 11.7067 2.62618 12.2933 2.7328 12.6201C2.88229 13.0784 3.11714 13.3119 3.5868 13.7788Z"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                                <path
                                  d="M10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12Z"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                              </g>
                            </g>
                          </g>
                        </svg>
                      ) : (
                        <div>
                          <svg
                            className={styles.seePassword}
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
                              <g id="Edit / Hide">
                                <path
                                  id="Vector"
                                  d="M3.99989 4L19.9999 20M16.4999 16.7559C15.1473 17.4845 13.6185 17.9999 11.9999 17.9999C8.46924 17.9999 5.36624 15.5478 3.5868 13.7788C3.1171 13.3119 2.88229 13.0784 2.7328 12.6201C2.62619 12.2933 2.62616 11.7066 2.7328 11.3797C2.88233 10.9215 3.11763 10.6875 3.58827 10.2197C4.48515 9.32821 5.71801 8.26359 7.17219 7.42676M19.4999 14.6335C19.8329 14.3405 20.138 14.0523 20.4117 13.7803L20.4146 13.7772C20.8832 13.3114 21.1182 13.0779 21.2674 12.6206C21.374 12.2938 21.3738 11.7068 21.2672 11.38C21.1178 10.9219 20.8827 10.6877 20.4133 10.2211C18.6338 8.45208 15.5305 6 11.9999 6C11.6624 6 11.3288 6.02241 10.9999 6.06448M13.3228 13.5C12.9702 13.8112 12.5071 14 11.9999 14C10.8953 14 9.99989 13.1046 9.99989 12C9.99989 11.4605 10.2135 10.9711 10.5608 10.6113"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                              </g>
                            </g>
                          </svg>
                        </div>
                      )}
                      Clave
                    </div>
                  </th>
                  <th className={styles.tableHeadName}></th>
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
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    ))}
                  </>
                ) : (
                  usersArr.map((user, index) => {
                    return (
                      <UserSortableItem
                        deleteUsers={deleteUsers}
                        setDeleteUsers={setDeleteUsers}
                        user={user}
                        key={user._id}
                        invisible={activeUser?._id === user._id}
                        tableIndex={25 * (pageSelected - 1) + index + 1}
                      >
                        <>
                          <td className={styles.tableItem}>
                            <p className={styles.name}>{`${user.rol}`}</p>
                          </td>
                          <td className={styles.tableItem}>
                            <p className={styles.name}>{`${user.dni}`}</p>
                          </td>
                          <td className={styles.tableItem}>
                            <p className={styles.name}>
                              {Array.isArray(user.curso) &&
                              user.curso.length > 0
                                ? user.curso
                                    .map((curso) => {
                                      if ((curso as Curso).name)
                                        return (curso as Curso).name;
                                    })
                                    .join(" | ")
                                : "N/A"}
                            </p>
                          </td>
                          <td className={styles.tableItem}>
                            <p className={styles.name}>
                              {user.asignatura?.name || "N/A"}
                            </p>
                          </td>
                          <td className={styles.tableItem}>
                            <p className={styles.password}>
                              {passwordShowArr[index] ? (
                                <>
                                  <svg
                                    onClick={() => {
                                      const newPasswordShowArr = [
                                        ...passwordShowArr,
                                      ];
                                      newPasswordShowArr[index] = false;
                                      setPasswordShowArr(newPasswordShowArr);
                                    }}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <g
                                      id="SVGRepo_bgCarrier"
                                      strokeWidth="0"
                                    ></g>
                                    <g
                                      id="SVGRepo_tracerCarrier"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></g>
                                    <g id="SVGRepo_iconCarrier">
                                      <g id="Edit / Hide">
                                        <path
                                          id="Vector"
                                          d="M3.99989 4L19.9999 20M16.4999 16.7559C15.1473 17.4845 13.6185 17.9999 11.9999 17.9999C8.46924 17.9999 5.36624 15.5478 3.5868 13.7788C3.1171 13.3119 2.88229 13.0784 2.7328 12.6201C2.62619 12.2933 2.62616 11.7066 2.7328 11.3797C2.88233 10.9215 3.11763 10.6875 3.58827 10.2197C4.48515 9.32821 5.71801 8.26359 7.17219 7.42676M19.4999 14.6335C19.8329 14.3405 20.138 14.0523 20.4117 13.7803L20.4146 13.7772C20.8832 13.3114 21.1182 13.0779 21.2674 12.6206C21.374 12.2938 21.3738 11.7068 21.2672 11.38C21.1178 10.9219 20.8827 10.6877 20.4133 10.2211C18.6338 8.45208 15.5305 6 11.9999 6C11.6624 6 11.3288 6.02241 10.9999 6.06448M13.3228 13.5C12.9702 13.8112 12.5071 14 11.9999 14C10.8953 14 9.99989 13.1046 9.99989 12C9.99989 11.4605 10.2135 10.9711 10.5608 10.6113"
                                          stroke="#000000"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        ></path>
                                      </g>
                                    </g>
                                  </svg>
                                  {user.password}
                                </>
                              ) : (
                                <span
                                  onClick={() => {
                                    const newPasswordShowArr = [
                                      ...passwordShowArr,
                                    ];
                                    newPasswordShowArr[index] = true;
                                    setPasswordShowArr(newPasswordShowArr);
                                  }}
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <g
                                      id="SVGRepo_bgCarrier"
                                      strokeWidth="0"
                                    ></g>
                                    <g
                                      id="SVGRepo_tracerCarrier"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></g>
                                    <g id="SVGRepo_iconCarrier">
                                      <g id="Edit / Show">
                                        <g id="Vector">
                                          <path
                                            d="M3.5868 13.7788C5.36623 15.5478 8.46953 17.9999 12.0002 17.9999C15.5308 17.9999 18.6335 15.5478 20.413 13.7788C20.8823 13.3123 21.1177 13.0782 21.2671 12.6201C21.3738 12.2933 21.3738 11.7067 21.2671 11.3799C21.1177 10.9218 20.8823 10.6877 20.413 10.2211C18.6335 8.45208 15.5308 6 12.0002 6C8.46953 6 5.36623 8.45208 3.5868 10.2211C3.11714 10.688 2.88229 10.9216 2.7328 11.3799C2.62618 11.7067 2.62618 12.2933 2.7328 12.6201C2.88229 13.0784 3.11714 13.3119 3.5868 13.7788Z"
                                            stroke="#000000"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          ></path>
                                          <path
                                            d="M10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12Z"
                                            stroke="#000000"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          ></path>
                                        </g>
                                      </g>
                                    </g>
                                  </svg>
                                  ****
                                </span>
                              )}
                            </p>
                          </td>
                          <td className={styles.tableItem}>
                            <div>
                              <svg
                                onClick={() => {
                                  setUserDeleteIndex(index);
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
                                onClick={() => {
                                  setUserSelected(user);
                                }}
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
                          </td>
                        </>
                      </UserSortableItem>
                    );
                  })
                )}
              </tbody>
            </table>
          </SortableContext>
          <DragOverlay
            dropAnimation={{
              duration: 100,
              easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            }}
          >
            {activeUser ? (
              <tr
                className={`${
                  deleteUsers?.includes(activeUser._id)
                    ? `${styles.itemSelectedOverlay} ${styles.select}`
                    : activeUser.review
                    ? `${styles.itemSelectedOverlay} ${styles.wrong}`
                    : ""
                }  ${styles.userItem} ${deleteUsers ? "cursor-pointer" : ""} ${
                  styles.dragOverlay
                }`}
              >
                <td className={styles.tableItem}>
                  <p className={styles.name}>
                    <span>
                      {25 * (pageSelected - 1) +
                        getUserIndex(activeUser._id) +
                        1}
                    </span>
                    {`${activeUser.nombre} ${activeUser.apellido}`}
                  </p>
                </td>
                <td className={styles.tableItem}>
                  <p className={styles.name}>{`${activeUser.rol}`}</p>
                </td>
                <td className={styles.tableItem}>
                  <p className={styles.name}>{`${activeUser.dni}`}</p>
                </td>
                <td className={styles.tableItem}>
                  <p className={styles.name}>
                    {Array.isArray(activeUser.curso) &&
                    activeUser.curso.length > 0
                      ? activeUser.curso
                          .map((curso) => {
                            if ((curso as Curso).name)
                              return (curso as Curso).name;
                          })
                          .join(" | ")
                      : "N/A"}
                  </p>
                </td>
                <td className={styles.tableItem}>
                  <p className={styles.name}>
                    {activeUser.asignatura?.name || "N/A"}
                  </p>
                </td>
                <td className={styles.tableItem}>
                  <p className={styles.password}>
                    {passwordShowArr[getUserIndex(activeUser._id)] ? (
                      <>
                        <svg
                          onClick={() => {
                            const newPasswordShowArr = [...passwordShowArr];
                            newPasswordShowArr[getUserIndex(activeUser._id)] =
                              false;
                            setPasswordShowArr(newPasswordShowArr);
                          }}
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
                            <g id="Edit / Hide">
                              <path
                                id="Vector"
                                d="M3.99989 4L19.9999 20M16.4999 16.7559C15.1473 17.4845 13.6185 17.9999 11.9999 17.9999C8.46924 17.9999 5.36624 15.5478 3.5868 13.7788C3.1171 13.3119 2.88229 13.0784 2.7328 12.6201C2.62619 12.2933 2.62616 11.7066 2.7328 11.3797C2.88233 10.9215 3.11763 10.6875 3.58827 10.2197C4.48515 9.32821 5.71801 8.26359 7.17219 7.42676M19.4999 14.6335C19.8329 14.3405 20.138 14.0523 20.4117 13.7803L20.4146 13.7772C20.8832 13.3114 21.1182 13.0779 21.2674 12.6206C21.374 12.2938 21.3738 11.7068 21.2672 11.38C21.1178 10.9219 20.8827 10.6877 20.4133 10.2211C18.6338 8.45208 15.5305 6 11.9999 6C11.6624 6 11.3288 6.02241 10.9999 6.06448M13.3228 13.5C12.9702 13.8112 12.5071 14 11.9999 14C10.8953 14 9.99989 13.1046 9.99989 12C9.99989 11.4605 10.2135 10.9711 10.5608 10.6113"
                                stroke="#000000"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>
                            </g>
                          </g>
                        </svg>
                        {activeUser.password}
                      </>
                    ) : (
                      <span
                        onClick={() => {
                          const newPasswordShowArr = [...passwordShowArr];
                          newPasswordShowArr[getUserIndex(activeUser._id)] =
                            true;
                          setPasswordShowArr(newPasswordShowArr);
                        }}
                      >
                        <svg
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
                            <g id="Edit / Show">
                              <g id="Vector">
                                <path
                                  d="M3.5868 13.7788C5.36623 15.5478 8.46953 17.9999 12.0002 17.9999C15.5308 17.9999 18.6335 15.5478 20.413 13.7788C20.8823 13.3123 21.1177 13.0782 21.2671 12.6201C21.3738 12.2933 21.3738 11.7067 21.2671 11.3799C21.1177 10.9218 20.8823 10.6877 20.413 10.2211C18.6335 8.45208 15.5308 6 12.0002 6C8.46953 6 5.36623 8.45208 3.5868 10.2211C3.11714 10.688 2.88229 10.9216 2.7328 11.3799C2.62618 11.7067 2.62618 12.2933 2.7328 12.6201C2.88229 13.0784 3.11714 13.3119 3.5868 13.7788Z"
                                  stroke="#000000"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                                <path
                                  d="M10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12Z"
                                  stroke="#000000"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                              </g>
                            </g>
                          </g>
                        </svg>
                        ****
                      </span>
                    )}
                  </p>
                </td>
                <td className={styles.tableItem}>
                  <div>
                    <svg
                      onClick={() => {
                        setUserDeleteIndex(getUserIndex(activeUser._id));
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
                      onClick={() => {
                        setUserSelected(activeUser);
                      }}
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
                </td>
              </tr>
            ) : null}
          </DragOverlay>
        </DndContext>
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
