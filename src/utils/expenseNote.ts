// An expense row's `description` is built by the server from up to three
// parts joined with " | ":
//   - the employee's own text
//   - the approver's remark, starting with "[Approver:"
//   - the system's note on why the row was paid what it was, ending in
//     "([AUTO:FA])" or starting with "[AUTO:FA]"
// The server's wording is what HR and the manager also see, so it is shown
// as is; only the tag is removed.

const AUTO_TAG = '[AUTO:FA]';

export interface ParsedExpenseNote {
  employee: string[];
  approver: string[];
  system: string[];
}

const stripAutoTag = (part: string): string => {
  let text = part.trim();
  if (text.endsWith(`(${AUTO_TAG})`)) {
    text = text.slice(0, -(AUTO_TAG.length + 2));
  } else if (text.startsWith(AUTO_TAG)) {
    text = text.slice(AUTO_TAG.length);
  }
  return text.trim();
};

export const parseExpenseNote = (
  description?: string | null,
): ParsedExpenseNote => {
  const parsed: ParsedExpenseNote = {employee: [], approver: [], system: []};
  if (!description) return parsed;
  for (const raw of description.split(' | ')) {
    const part = raw.trim();
    if (!part) continue;
    if (part.endsWith(`(${AUTO_TAG})`) || part.startsWith(AUTO_TAG)) {
      const text = stripAutoTag(part);
      if (text) parsed.system.push(text);
    } else if (part.startsWith('[Approver:')) {
      parsed.approver.push(part);
    } else {
      parsed.employee.push(part);
    }
  }
  return parsed;
};
