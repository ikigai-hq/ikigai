import {Button, Input, Switch, Tooltip} from "antd";
import {CopyOutlined} from "@ant-design/icons";
import toast from "react-hot-toast";
import {t, Trans} from "@lingui/macro";
import * as React from "react";
import {useState} from "react";

import useDocumentStore from "../../context/ZustandDocumentStore";
import {Text, TextWeight} from "../common/Text";
import {formatPublicDocumentUrl} from "../../config/Routes";

export type ShareDocumentModalProps = {};

const DocumentSharing = ({}: ShareDocumentModalProps) => {
  const isPublic = useDocumentStore((state) => state.masterDocument?.isPublic);
  const switchPublic = useDocumentStore((state) => state.switchPublic);
  const activeDocument = useDocumentStore((state) => state.masterDocument);
  const [loading, setLoading] = useState(false);

  const onSwitchPublic = async (isPublic: boolean) => {
    setLoading(true);
    await switchPublic(isPublic);
    setLoading(false);
  };
  
  const publicUrl = formatPublicDocumentUrl(
    activeDocument?.id,
    activeDocument?.title
  );
  const onClickCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success(t`Copied!`);
  };

  return (
    <div style={{ width: "350px" , padding: '2px 5px'}}>
      <div>
        <div style={{ display: "flex" }}>
          <div style={{ flex: "1" }}>
            <Text weight={TextWeight.bold}>
              <Trans>Publish document</Trans>
            </Text>
            <br />
            <Text type="secondary">
              <Trans>People can access this page via the address below.</Trans>
            </Text>
          </div>
          <div>
            <Switch
              checked={isPublic}
              onChange={onSwitchPublic}
              loading={loading}
            />
          </div>
        </div>
        {isPublic && (
          <Input.Group compact>
            <Input
              style={{ width: "calc(100% - 33px)" }}
              defaultValue={publicUrl}
              readOnly
            />
            <Tooltip title={t`Copy public url`}>
              <Button icon={<CopyOutlined />} onClick={onClickCopy} />
            </Tooltip>
          </Input.Group>
        )}
      </div>
    </div>
  );
};

export default DocumentSharing;
