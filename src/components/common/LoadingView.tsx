interface LoadingViewProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingView({
  message = "로딩 중...",
  fullScreen = true,
}: LoadingViewProps) {
  const content = (
    <div className="text-center">
      <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-primary-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        {content}
      </div>
    );
  }
  return <div className="py-10">{content}</div>;
}
