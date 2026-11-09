import {ResultInfo} from '../components/ui/ResultModal';
import {getServerWarnings, getUserFacingError} from './errorMessage';

// Frappe sends success notes ("Stock successfully reconciled for X") in the
// same _server_messages as real warnings, so sort them before showing.
const SUCCESS_NOTE = /success|reconciled|saved|updated/i;
const PROBLEM_NOTE =
  /skip|not |no |fail|could ?n.?t|unable|error|warning|only/i;

const isSuccessNote = (text: string) =>
  SUCCESS_NOTE.test(text) && !PROBLEM_NOTE.test(text);

// The result card after a stock count is saved.
export const stockCountSaved = (
  response: any,
  storeName?: string,
): ResultInfo => {
  const notes = getServerWarnings(response);
  const problems = notes.filter(note => !isSuccessNote(note));
  const successes = notes.filter(isSuccessNote);
  const where = storeName ? ` for ${storeName}` : '';

  if (problems.length) {
    return {
      tone: 'warning',
      title: 'Stock saved, with notes',
      message: `The count${where} is saved, but some items need a look:`,
      points: problems,
    };
  }
  return {
    tone: 'success',
    title: 'Stock count saved',
    message: successes[0] ?? `The stock count${where} is updated.`,
    points: successes.length > 1 ? successes.slice(1) : undefined,
    buttonLabel: 'Done',
  };
};

export const stockCountFailed = (error: any): ResultInfo => ({
  tone: 'error',
  title: "Couldn't save the stock",
  message: getUserFacingError(
    error,
    'The stock count was not saved. Please try again.',
  ),
  buttonLabel: 'Try again',
});
