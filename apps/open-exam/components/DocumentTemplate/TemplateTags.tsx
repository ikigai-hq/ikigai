import { SelectProps, Tag } from "antd";
import { t } from "@lingui/macro";

import {
  GetCommunityTemplates_getCommunityDocumentTemplates as IDocumentTemplate
} from "graphql/types";
import { Select } from "../common/Select";
import useDocumentTemplateStore from "../../context/ZustandDocumentTemplateStore";

export type TemplateTagsProps = {
  template: IDocumentTemplate;
  editMode: boolean;
  onChange?: (template: IDocumentTemplate) => void;
};

const TemplateTags = ({ template, editMode, onChange }: TemplateTagsProps) => {
  const availableTags = useDocumentTemplateStore(state => state.availableTags);
  if (!editMode) {
    return (
      <div style={{ marginTop: "5px" }}>
        {template.tags.map((tag) => (
          <Tag key={tag.tag}>{tag.tag}</Tag>
        ))}
      </div>
    );
  }
  
  const onSelectTag = (tag: string) => {
    template.tags.push({ tag });
    onChange({ ...template });
  };
  
  const onDeselectTag = (tag: string) => {
    const index = template.tags.findIndex(t => t.tag === tag);
    if (index > -1) {
      template.tags.splice(index, 1);
      onChange({ ...template });
    }
  };
  
  const options: SelectProps['options'] = availableTags.map(availableTag => {
    return {
      label: availableTag,
      value: availableTag,
    };
  });
  const selectedTags = template.tags.map(tag => tag.tag);
  return (
    <div>
      <Select
        mode="tags"
        placeholder={t`Add tag for document template`}
        options={options}
        value={selectedTags}
        showArrow={false}
        onSelect={onSelectTag}
        onDeselect={onDeselectTag}
      />
    </div>
  );
};

export default TemplateTags;
