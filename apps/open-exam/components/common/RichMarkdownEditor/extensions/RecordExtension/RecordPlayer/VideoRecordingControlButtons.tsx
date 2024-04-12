import {Button, Space} from "antd";
import {CheckCircleOutlined, DeleteOutlined} from "@ant-design/icons";
import {isMobileView} from "../../../../../../hook/UseSupportMobile";

export type VideoRecordingControlButtonsProps = {
  cancelRecord: () => void | Promise<void>;
  uploading: boolean;
  endRecording: () => void | Promise<void>;
};

const VideoRecordingControlButtons = ({ cancelRecord, endRecording, uploading }: VideoRecordingControlButtonsProps) => {
  const isMobile = isMobileView();
  if (!isMobile) {
    return (
      <Space size={20} style={{ justifyContent: 'end' }}>
        <Button danger type="link" block onClick={cancelRecord}>
          <Space align="center">
            <DeleteOutlined />
            Cancel
          </Space>
        </Button>
        <Button loading={uploading} type="link" block onClick={endRecording}>
          <Space align="center">
            <CheckCircleOutlined />
            Completed
          </Space>
        </Button>
      </Space>
    );
  }
  
  return (
    <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
      <Button danger type="link" block onClick={cancelRecord}>
        <Space align="center">
          <DeleteOutlined />
          Cancel
        </Space>
      </Button>
      <Button loading={uploading} type="link" block onClick={endRecording}>
        <Space align="center">
          <CheckCircleOutlined />
          Completed
        </Space>
      </Button>
    </div>
  );
};

export default VideoRecordingControlButtons;
