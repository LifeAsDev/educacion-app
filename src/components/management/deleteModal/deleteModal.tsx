import styles from "../styles.module.css";

export default function DeleteModal({
  modalItemName,
  itemPronoun,
  yesAction,
  noAction,
}: {
  modalItemName: string;
  itemPronoun: string;
  yesAction: () => void;
  noAction: () => void;
}) {
  return (
    <div className={styles.deleteUserBox}>
      <div className={styles.deleteUserModal}>
        <p>
          ¿Estás seguro que deseas borrar
          <br /> {itemPronoun}
          <span> {modalItemName}</span>?
        </p>
        <div className={styles.deleteModalOptionsBox}>
          <div onClick={noAction} className={styles.modalOption}>
            No
          </div>
          <div onClick={yesAction} className={styles.modalOption}>
            Si
          </div>
        </div>
      </div>
    </div>
  );
}
