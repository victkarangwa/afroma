import { Ionicons } from "@expo/vector-icons";
import { Button, Dialog, Modal, Paragraph, Portal } from "react-native-paper";
import { tw } from "react-native-tailwindcss";
import TextComponent from "../Text";

interface ModalProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  description: string;
  status?: "error" | "success" | "warning" | "info";
  btnText?: string;
}

const ModalComponent = (props: ModalProps) => {
  const {
    visible,
    onDismiss,
    title,
    description,
    status = "error",
    btnText = "Try Again",
  } = props;
  let icon:
    | "close-circle-outline"
    | "checkmark-circle-outline"
    | "alert-circle-outline"
    | "information-circle-outline";
  let color: string;
  switch (status) {
    case "error":
      icon = "close-circle-outline";
      color = "red";
      break;
    case "success":
      icon = "checkmark-circle-outline";
      color = "green";
      break;
    case "warning":
      icon = "alert-circle-outline";
      color = "yellow";
      break;
    case "info":
      icon = "information-circle-outline";
      color = "blue";
      break;
    default:
      icon = "information-circle-outline";
      color = "blue";
      break;
  }

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          tw.bgWhite,
          tw.p8,
          tw.roundedL,
          tw.mX8,
          tw.h1_2,
        ]}
        theme={{
          colors: {
            backdrop: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <Ionicons
          name={icon}
          size={36}
          color={color}
          style={[tw.mT2, tw.textCenter]}
        />
        <TextComponent
          variant="titleMedium"
          style={[tw.textCenter, tw.fontBold, tw.pY4]}
        >
          {title}
        </TextComponent>
        <TextComponent style={[tw.textCenter]}>{description}</TextComponent>
        <Button
          mode="outlined"
          onPress={onDismiss}
          style={[tw.mY6, { borderColor: color, color }]}
          textColor={color}
        >
          {btnText}
        </Button>
      </Modal>
    </Portal>
  );
};

export default ModalComponent;
