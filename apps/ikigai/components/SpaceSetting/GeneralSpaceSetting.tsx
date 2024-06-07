import { t, Trans } from "@lingui/macro";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useMutation } from "@apollo/client";
import { Button, Text, TextField } from "@radix-ui/themes";

import useSpaceStore from "store/SpaceStore";
import { UPDATE_SPACE } from "graphql/mutation/SpaceMutation";
import { handleError } from "graphql/ApolloClient";
import { UpdateSpace } from "graphql/types";

const GeneralSpaceSetting = () => {
  const spaceId = useSpaceStore((state) => state.spaceId);
  const setSpaceName = useSpaceStore((state) => state.setSpaceName);
  const [innerSpaceName, setInnerSpaceName] = useState(
    useSpaceStore.getState().space?.name || "",
  );

  const [updateSpace, { loading }] = useMutation<UpdateSpace>(UPDATE_SPACE, {
    onError: handleError,
  });

  const onUpdateSpace = async () => {
    const { data } = await updateSpace({
      variables: {
        spaceId,
        data: {
          name: innerSpaceName,
          bannerId: undefined,
        },
      },
    });

    if (data) {
      toast.success(t`Updated!`);
      setSpaceName(innerSpaceName);
    }
  };

  return (
    <div>
      <div>
        <Text size="3" weight="bold">
          <Trans>Space name</Trans>
        </Text>
        <TextField.Root
          value={innerSpaceName}
          onChange={(e) => setInnerSpaceName(e.currentTarget.value)}
          placeholder={t`Type space name...`}
        />
      </div>
      <Button
        loading={loading}
        disabled={loading}
        onClick={onUpdateSpace}
        style={{ marginTop: 5 }}
      >
        <Trans>Update</Trans>
      </Button>
    </div>
  );
};

export default GeneralSpaceSetting;
