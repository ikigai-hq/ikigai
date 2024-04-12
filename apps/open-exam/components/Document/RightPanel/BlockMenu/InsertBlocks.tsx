import { Text, TextWeight } from "components/common/Text";
import React, { ChangeEvent, FC, useCallback, useState } from "react";
import styled from "styled-components";
import { Input } from "antd";
import { GroupBlockItem, defaultMenu } from "./defaultMenu.config";
import { BlockGroupItem } from "./BlockGroupItem";
import { cloneDeep, debounce } from "lodash";
import { Trans, t } from "@lingui/macro";
import usePageBlockStore from "context/ZustandPageBlockStore";
import { ParentBlockMenu } from "@zkls/editor/dist/types/extensions.enum";

interface Props {}

const initialBlockList: GroupBlockItem[] = Object.keys(defaultMenu).map(
  (m) => defaultMenu[m],
);

export const InsertBlocks: FC<Props> = () => {
  const [searchValue, setSearchValue] = useState("");
  const [autoExpand, setAutoExpand] = useState(false);
  const [blockList, setBlockList] =
    useState<GroupBlockItem[]>(initialBlockList);

  const pageBlockMode = usePageBlockStore((state) => state.pageBlockMode);

  const debounceSearch = useCallback(
    debounce((value: string) => {
      const clonedMenu = cloneDeep(initialBlockList);
      const result: GroupBlockItem[] = [];
      if (value.length === 0) {
        setBlockList(clonedMenu);
        setAutoExpand(false);
        return;
      }
      clonedMenu.forEach((m) => {
        const matchParentName =
          m.name.toLowerCase().indexOf(value.toLocaleLowerCase()) !== -1;
        const filterChildren = m.children.filter(
          (item) => item.name.toLowerCase().indexOf(value.toLowerCase()) !== -1,
        );

        if (matchParentName && !filterChildren.length) {
          result.push(m);
        }

        if (filterChildren.length) {
          m.children = filterChildren;
          result.push(m);
        }
      });
      if (!result.length) return setBlockList(clonedMenu);
      setAutoExpand(true);
      setBlockList(result);
    }, 300),
    [],
  );

  const onFilterSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchValue(query);
    debounceSearch(query);
  };

  return (
    <InsertBlocksContainer>
      <div style={{ margin: "0 16px" }}>
        <SearchInput
          allowClear
          value={searchValue}
          onChange={onFilterSearch}
          height={32}
          placeholder={t`Search`}
        />
        <Text level={2} weight={TextWeight.mediumlv2}>
          <Trans>Blocks</Trans>
        </Text>
      </div>
      <ListBlock>
        {blockList
          .filter((m) =>
            pageBlockMode ? m.name !== ParentBlockMenu.PageLayout : true,
          )
          .map((b) => {
            return (
              <BlockGroupItem
                key={b.name}
                autoExpand={autoExpand}
                groupName={b.name}
                icon={b.icon}
                nestedMenu={b.children}
              />
            );
          })}
      </ListBlock>
    </InsertBlocksContainer>
  );
};

export const InsertBlocksContainer = styled.div`
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const SearchInput = styled(Input.Search)`
  margin-bottom: 12px;
`;

const ListBlock = styled.div`
  overflow: auto;
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
