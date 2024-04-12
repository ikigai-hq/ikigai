import { GroupBlock, EmbedDescriptor, MenuItem } from "../types";

export const categoryBlockMenu: {
  [key in GroupBlock]: (MenuItem | EmbedDescriptor)[];
} = {
  [GroupBlock.Text]: [],
  [GroupBlock.BasicBlock]: [],
  [GroupBlock.Notice]: [],
  [GroupBlock.FileUpload]: [],
  [GroupBlock.Quiz]: [],
  [GroupBlock.Report]: [],
  [GroupBlock.Media]: [],
  [GroupBlock.RecordBlock]: [],
  [GroupBlock.Embeds]: [],
  [GroupBlock.TextColor]: [],
};
