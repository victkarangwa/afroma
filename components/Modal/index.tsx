import { Ionicons } from "@expo/vector-icons";
import { Button, Dialog, Modal, Paragraph, Portal } from "react-native-paper";
import { tw } from "react-native-tailwindcss";
import TextComponent from "../Text";

interface ModalProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  description: string;
}

const ModalComponent = (props: ModalProps) => {
  const { visible, onDismiss, title, description } = props;
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
          name="close-circle-outline"
          size={36}
          color="red"
          style={[tw.mT2, tw.textCenter]}
        />
        <TextComponent
          variant="titleMedium"
          style={[tw.textCenter, tw.fontBold, tw.pY4]}
        >
          {title}
        </TextComponent>
        <TextComponent style={[tw.textCenter]}>{description}</TextComponent>
        <Button mode="outlined" onPress={onDismiss} style={[tw.mY6]}>
          Try Again
        </Button>
      </Modal>
    </Portal>
  );
};

export default ModalComponent;
