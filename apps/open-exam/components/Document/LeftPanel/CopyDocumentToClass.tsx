import { useMutation, useQuery } from "@apollo/client";
import { Divider, Typography } from "antd";
import { t, Trans } from "@lingui/macro";
import toast from "react-hot-toast";

import { GET_ORG_SPACES } from "graphql/query/ClassQuery";
import { handleError } from "graphql/ApolloClient";
import { GetOrgSpaces } from "graphql/types";
import Modal from "components/common/Modal";
import Loading from "components/Loading";
import { Select } from "components/common/Select";
import { useState } from "react";
import { Button } from "components/common/Button";
import { DUPLICATE_TO_CLASS } from "graphql/mutation/DocumentMutation";
import useClassStore from "context/ZustandClassStore";

export type MoveDocumentProps = {
  selectedDocumentId: string;
  visible: boolean;
  onClose: () => void;
};

const CopyDocumentToClass = ({ visible, onClose, selectedDocumentId }: MoveDocumentProps) => {
  const [selectedClassId, setSelectedClassId] = useState<undefined | number>();
  const { data, loading } = useQuery<GetOrgSpaces>(GET_ORG_SPACES, {
    onError: handleError,
    fetchPolicy: "network-only",
  });
  const [duplicateToClass, { loading: loadingMove }] = useMutation(DUPLICATE_TO_CLASS, {
    onError: handleError,
  });
  const currentClassId = useClassStore(state => state.classId);
  const [keyword, setKeyword] = useState("");
  
  const move = async () => {
    const { data } = await duplicateToClass({
      variables: {
        originalDocumentId: selectedDocumentId,
        classId: selectedClassId,
      },
    });
    
    if (data) {
      toast.success(t`Copied!`);
      onClose();
    }
  };
  
  const options = (data?.spaceGetAllOrgSpaces || [])
    .filter(data => data.id !== currentClassId)
    .filter(data =>
      data.name.toLowerCase().includes(keyword.toLowerCase()) ||
      data.id.toString() == keyword
    )
    .map(data => {
      return {
        value: data.id,
        label: data.name,
      };
    });
  
  return (
    <Modal
      visible={visible}
      onClose={onClose}
    >
      {
        loading && !data &&
          <Loading />
      }
      {
        !loading && data && (
          <div>
            <div>
              <Typography.Title level={3}>
                <Trans>
                  Duplicate to class
                </Trans>
              </Typography.Title>
              <Select
                showSearch
                allowClear
                placeholder={t`Type to search class`}
                size="large"
                options={options}
                onSelect={(classId: number) => setSelectedClassId(classId)}
                value={selectedClassId}
                onSearch={setKeyword}
              />
            </div>
            <Divider />
            <Button
              type="primary"
              style={{ float: "right" }}
              loading={loadingMove}
              disabled={loadingMove || !selectedClassId}
              onClick={move}
            >
              <Trans>Copy</Trans>
            </Button>
          </div>
        )
      }
    </Modal>
  );
};

export default CopyDocumentToClass;
