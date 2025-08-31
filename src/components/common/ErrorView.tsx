import ActionButton from "@components/common/ActionButton";

interface ErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void | Promise<void>;
  fullScreen?: boolean;
}

export default function ErrorView({
  title = "문제가 발생했습니다",
  message,
  onRetry,
  fullScreen = false,
}: ErrorViewProps) {
  const body = (
    <div className="text-center">
      <h2 className="text-lg font-semibold text-red-700 mb-2">{title}</h2>
      {message && (
        <p className="text-gray-600 mb-4 whitespace-pre-wrap">{message}</p>
      )}
      {onRetry && (
        <ActionButton
          text="다시 시도"
          variant="primary"
          size="md"
          onClick={() => onRetry()}
        />
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        {body}
      </div>
    );
  }
  return <div className="py-8">{body}</div>;
}
