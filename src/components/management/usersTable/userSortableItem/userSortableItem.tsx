import React, { Dispatch, ReactNode, SetStateAction } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import User from "@/models/user";
import styles from "../../styles.module.css";

export default function UserSortableItem({
  children,
  user,
  deleteUsers,
  setDeleteUsers,
  invisible,
}: {
  children?: ReactNode;
  user: User;
  deleteUsers: string[] | null;
  setDeleteUsers: Dispatch<SetStateAction<string[] | null>>;
  invisible: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: user._id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (deleteUsers) {
          if (deleteUsers.includes(user._id)) {
            setDeleteUsers((prev) => prev!.filter((item) => item !== user._id));
          } else {
            setDeleteUsers((prev) => [...prev!, user._id]);
          }
        }
      }}
      className={`${
        deleteUsers?.includes(user._id)
          ? `${styles.itemSelectedOverlay} ${styles.select}`
          : user.review
          ? `${styles.itemSelectedOverlay} ${styles.wrong}`
          : ""
      }  ${styles.userItem} ${deleteUsers ? "cursor-pointer" : ""} ${
        invisible ? "invisible" : ""
      }`}
      key={user._id}
    >
      {children}
    </tr>
  );
}
