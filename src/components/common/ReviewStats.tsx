import React from "react";

export default function ReviewStats({
  average,
  distribution,
}: {
  average: number;
  distribution: Record<number, number>;
}) {
  const max = Math.max(1, ...Object.values(distribution));
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">리뷰 통계</h3>
      <div className="flex items-center gap-6 mb-4">
        <div>
          <div className="text-3xl font-bold">{average.toFixed(1)}</div>
          <div className="text-xs text-gray-500">평균 평점</div>
        </div>
      </div>
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] || 0;
          const width = `${Math.round((count / max) * 100)}%`;
          return (
            <div key={star} className="flex items-center gap-2">
              <div className="w-10 text-sm text-gray-600">{star}점</div>
              <div className="flex-1 h-3 bg-gray-100 rounded">
                <div className="h-3 bg-primary-500 rounded" style={{ width }} />
              </div>
              <div className="w-8 text-right text-sm text-gray-600">
                {count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
