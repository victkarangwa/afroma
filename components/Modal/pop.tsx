import { Modal, Portal } from "react-native-paper";
import { tw } from "react-native-tailwindcss";

interface ModalProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
}

const PopupModal = (props: ModalProps) => {
  const {
    visible,
    onDismiss,
    children,
  } = props;


  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          tw.bgWhite,
          tw.p8,
          tw.rounded,
          tw.mX8,
        ]}
        theme={{
          colors: {
            backdrop: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
       {children}
      </Modal>
    </Portal>
  );
};

export default PopupModal;
