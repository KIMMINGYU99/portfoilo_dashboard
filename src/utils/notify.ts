import toast from 'react-hot-toast';

export function notifySuccess(message: string) {
  toast.success(message);
}

export function notifyError(error: unknown, fallback = '요청 처리 중 오류가 발생했습니다.') {
  const msg = error instanceof Error ? error.message : fallback;
  toast.error(msg);
  return msg;
}
